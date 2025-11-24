package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"crypto/tls"
	b64 "encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"reflect"
	"strconv"
	"strings"

	"github.com/flightctl/flightctl-ui/common"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
	"github.com/flightctl/flightctl/api/v1beta1"
	"github.com/openshift/osincli"
)

// Provider type constants - use backend constants instead of hardcoding
var (
	ProviderTypeK8s       = string(v1beta1.K8s)
	ProviderTypeOIDC      = string(v1beta1.Oidc)
	ProviderTypeAAP       = string(v1beta1.Aap)
	ProviderTypeOAuth2    = string(v1beta1.Oauth2)
	ProviderTypeOpenShift = string(v1beta1.Openshift)
)

type TokenData struct {
	// IDToken (JWT token)
	//   - OIDC: Used for API authentication and GetUserInfo (via backend API)
	//   - K8s: Used for API authentication and GetUserInfo
	//   - OAuth2/AAP: Not used
	IDToken string `json:"idToken"`

	// AccessToken (opaque token)
	//   - OIDC: Stored but not directly used (IDToken is preferred via GetAuthToken())
	//   - OAuth2/AAP: Used for API authentication and GetUserInfo
	//   - K8s: Not used
	AccessToken string `json:"accessToken"`

	RefreshToken string `json:"refreshToken"`
	Provider     string `json:"provider,omitempty"`
}

// GetAuthToken returns the token to use for API authentication.
func (t TokenData) GetAuthToken() string {
	if t.IDToken != "" {
		return t.IDToken
	}
	return t.AccessToken
}

type LoginParameters struct {
	Code         string `json:"code"`
	CodeVerifier string `json:"codeVerifier,omitempty"` // Optional, will be retrieved from cookie if not provided
}

type AuthProvider interface {
	GetToken(loginParams LoginParameters) (TokenData, *int64, error)
	GetUserInfo(tokenData TokenData) (string, *http.Response, error)
	RefreshToken(refreshToken string) (TokenData, *int64, error)
	Logout(token string) (string, error)
	GetLoginRedirectURL(codeChallenge string) string
}

func setCookie(w http.ResponseWriter, value TokenData) error {
	cookieVal, err := json.Marshal(value)
	if err != nil {
		return err
	}
	cookie := http.Cookie{
		Name:     common.CookieSessionName,
		Value:    b64.StdEncoding.EncodeToString(cookieVal),
		Secure:   config.TlsCertPath != "",
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	}
	http.SetCookie(w, &cookie)
	return nil
}

func ParseSessionCookie(r *http.Request) (TokenData, error) {
	tokenData := TokenData{}
	cookie, err := r.Cookie(common.CookieSessionName)
	if err != nil && !errors.Is(err, http.ErrNoCookie) {
		log.GetLogger().Debugf("Error getting session cookie: %v", err)
		return tokenData, err
	}

	if cookie != nil {
		val, err := b64.StdEncoding.DecodeString(cookie.Value)
		if err != nil {
			log.GetLogger().Debugf("Error decoding session cookie: %v", err)
			return tokenData, err
		}

		err = json.Unmarshal(val, &tokenData)
		if err != nil {
			log.GetLogger().Debugf("Error unmarshaling session cookie: %v", err)
			return tokenData, err
		}
		log.GetLogger().Debugf("Parsed session cookie (provider: %s, id token length: %d, access token length: %d)", tokenData.Provider, len(tokenData.IDToken), len(tokenData.AccessToken))
		return tokenData, err
	}
	log.GetLogger().Debug("No session cookie found in request")
	return tokenData, nil
}

func getUserInfo(token string, tlsConfig *tls.Config, authURL string, userInfoEndpoint string) (*[]byte, *http.Response, error) {
	client := &http.Client{Transport: &http.Transport{
		TLSClientConfig: tlsConfig,
	}}

	req, err := http.NewRequest(http.MethodGet, userInfoEndpoint, nil)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to create http request")
		return nil, nil, err
	}

	req.Header.Add(common.AuthHeaderKey, "Bearer "+token)

	proxyUrl, err := url.Parse(authURL)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to parse proxy url")
		return nil, nil, err
	}
	req.Header.Add("X-Forwarded-Host", proxyUrl.Host)
	req.Header.Add("X-Forwarded-Proto", proxyUrl.Scheme)

	resp, err := client.Do(req)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to get user info")
		return nil, nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.GetLogger().WithError(err).Warn("Failed to read response body")
			return nil, resp, err
		}
		return &body, resp, nil
	}

	return nil, resp, nil
}

func getToken(r *http.Request) (string, error) {
	headerVal := r.Header.Get(common.AuthHeaderKey)
	token := strings.TrimPrefix(headerVal, "Bearer ")
	if token == headerVal {
		return "", errors.New("incorrect auth header value")
	}
	token = strings.TrimSpace(token)
	return token, nil
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func respondWithError(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	errorResp := ErrorResponse{Error: message}
	response, err := json.Marshal(errorResp)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to marshal error response")
		return
	}
	if _, err := w.Write(response); err != nil {
		log.GetLogger().WithError(err).Warn("Failed to write error response")
	}
}

// exchangeToken exchanges an authorization code for an access token
// PKCE is required - code_verifier must be present. The function extracts the token URL
// and TLS config from the osincli client and manually constructs the token exchange request
// with PKCE parameters.
// If tokenURL, clientID, and redirectURI are provided, they will be used instead of reflection.
func exchangeToken(loginParams LoginParameters, client *osincli.Client, tokenURL string, clientID string, redirectURI string) (TokenData, *int64, error) {
	// PKCE is required - fail if code_verifier is missing
	if loginParams.CodeVerifier == "" {
		return TokenData{}, nil, fmt.Errorf("PKCE code_verifier is required but not provided")
	}

	// Manually construct the token request with PKCE parameters
	// Use provided config values if available, otherwise extract from client using reflection
	var configValue reflect.Value
	if tokenURL == "" || clientID == "" || redirectURI == "" {
		// Extract token URL from client config using reflection
		// osincli.Client.Config is not exported, so we use reflection to access it
		clientValue := reflect.ValueOf(client)
		if clientValue.Kind() == reflect.Ptr {
			if clientValue.IsNil() {
				return TokenData{}, nil, fmt.Errorf("client is nil")
			}
			clientValue = clientValue.Elem()
		}

		configField := clientValue.FieldByName("Config")
		if !configField.IsValid() {
			// Try alternative field names (in case the structure changed)
			configField = clientValue.FieldByName("config")
			if !configField.IsValid() {
				// Log available fields for debugging
				fieldNames := make([]string, 0, clientValue.NumField())
				for i := 0; i < clientValue.NumField(); i++ {
					fieldNames = append(fieldNames, clientValue.Type().Field(i).Name)
				}
				log.GetLogger().Warnf("Failed to find Config field in osincli.Client. Available fields: %v", fieldNames)
				return TokenData{}, nil, fmt.Errorf("failed to access client config for PKCE flow: Config field not found")
			}
		}

		// Handle both pointer and non-pointer Config field
		configValue = configField
		if configField.Kind() == reflect.Ptr {
			if configField.IsNil() {
				return TokenData{}, nil, fmt.Errorf("client config is nil")
			}
			configValue = configField.Elem()
		}

		if tokenURL == "" {
			tokenURLField := configValue.FieldByName("TokenUrl")
			if !tokenURLField.IsValid() {
				// Try alternative field name
				tokenURLField = configValue.FieldByName("tokenUrl")
				if !tokenURLField.IsValid() {
					return TokenData{}, nil, fmt.Errorf("failed to access token URL from client config for PKCE flow")
				}
			}
			tokenURL = tokenURLField.String()
		}

		if clientID == "" {
			// Extract client ID from config
			clientIDField := configValue.FieldByName("ClientId")
			if !clientIDField.IsValid() {
				// Try alternative field name
				clientIDField = configValue.FieldByName("clientId")
				if !clientIDField.IsValid() {
					return TokenData{}, nil, fmt.Errorf("failed to access client ID from client config for PKCE flow")
				}
			}
			clientID = clientIDField.String()
		}

		if redirectURI == "" {
			// Extract redirect URI from config
			redirectURIField := configValue.FieldByName("RedirectUrl")
			if !redirectURIField.IsValid() {
				// Try alternative field name
				redirectURIField = configValue.FieldByName("redirectUrl")
				if !redirectURIField.IsValid() {
					return TokenData{}, nil, fmt.Errorf("failed to access redirect URI from client config for PKCE flow")
				}
			}
			redirectURI = redirectURIField.String()
		}
	}

	// Extract TLS config from client's Transport
	var tlsConfig *tls.Config
	if client.Transport != nil {
		transportValue := reflect.ValueOf(client.Transport)
		// Handle both *http.Transport and wrapped transports (like AAPRoundTripper)
		if transportValue.Kind() == reflect.Ptr {
			transportValue = transportValue.Elem()
		}
		// Check if it's an http.Transport or has a Transport field (for wrapped transports)
		tlsConfigField := transportValue.FieldByName("TLSClientConfig")
		if tlsConfigField.IsValid() && tlsConfigField.Kind() == reflect.Ptr {
			if !tlsConfigField.IsNil() {
				tlsConfig = tlsConfigField.Interface().(*tls.Config)
			}
		} else {
			// Try to get Transport field for wrapped transports
			transportField := transportValue.FieldByName("Transport")
			if transportField.IsValid() {
				nestedTransport := transportField.Interface()
				nestedValue := reflect.ValueOf(nestedTransport)
				if nestedValue.Kind() == reflect.Ptr {
					nestedValue = nestedValue.Elem()
				}
				tlsConfigField = nestedValue.FieldByName("TLSClientConfig")
				if tlsConfigField.IsValid() && tlsConfigField.Kind() == reflect.Ptr {
					if !tlsConfigField.IsNil() {
						tlsConfig = tlsConfigField.Interface().(*tls.Config)
					}
				}
			}
		}
	}

	// Manually construct the token exchange request with PKCE parameters
	ret := TokenData{}

	// Prepare form data for token request
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", loginParams.Code)
	data.Set("code_verifier", loginParams.CodeVerifier)
	data.Set("client_id", clientID)
	data.Set("redirect_uri", redirectURI)

	// Log the exact request being sent (without sensitive code/verifier values)
	log.GetLogger().Infof("Token exchange request (PKCE): grant_type=authorization_code, client_id=%s, redirect_uri=%s, code_verifier length=%d, code length=%d, token_url=%s", clientID, redirectURI, len(loginParams.CodeVerifier), len(loginParams.Code), tokenURL)
	log.GetLogger().Debugf("Token exchange form data (sanitized): grant_type=%s, client_id=%s, redirect_uri=%s, code_verifier=[REDACTED], code=[REDACTED]", data.Get("grant_type"), data.Get("client_id"), data.Get("redirect_uri"))

	// Create HTTP request
	req, err := http.NewRequest(http.MethodPost, tokenURL, strings.NewReader(data.Encode()))
	if err != nil {
		return ret, nil, fmt.Errorf("failed to create token request: %w", err)
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json") // Request JSON response

	// Create HTTP client with TLS config
	httpClient := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: tlsConfig,
		},
	}

	// Execute request
	resp, err := httpClient.Do(req)
	if err != nil {
		return ret, nil, fmt.Errorf("failed to exchange token: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return ret, nil, fmt.Errorf("failed to read token response: %w", err)
	}

	// Check for HTTP error status
	if resp.StatusCode != http.StatusOK {
		// Log the full response for debugging
		log.GetLogger().Warnf("Token exchange failed with status %d. Response body: %s", resp.StatusCode, string(body))
		return ret, nil, fmt.Errorf("token exchange failed with status %d: %s", resp.StatusCode, string(body))
	}

	// Check content type to determine response format
	contentType := resp.Header.Get("Content-Type")
	bodyPreview := string(body)
	if len(bodyPreview) > 200 {
		bodyPreview = bodyPreview[:200] + "..."
	}
	log.GetLogger().Infof("Token response Content-Type: %s, Body length: %d, Body preview: %s", contentType, len(body), bodyPreview)

	// Parse response based on content type
	var tokenResponse map[string]interface{}

	// GitHub and some OAuth providers return form-encoded responses
	if strings.Contains(contentType, "application/x-www-form-urlencoded") {
		// Parse as form-encoded
		values, err := url.ParseQuery(string(body))
		if err != nil {
			log.GetLogger().Warnf("Failed to parse form-encoded token response. Status: %d, Content-Type: %s, Body: %s", resp.StatusCode, contentType, string(body))
			return ret, nil, fmt.Errorf("failed to parse form-encoded token response: %w (response body: %s)", err, string(body))
		}

		// Log all parsed values for debugging
		log.GetLogger().Debugf("Parsed form-encoded response values: %v", values)

		// Check for errors in form-encoded response
		errorParam := values.Get("error")
		if errorParam != "" {
			errorDesc := values.Get("error_description")
			errorURI := values.Get("error_uri")
			log.GetLogger().Warnf("OAuth provider returned error in form-encoded response: error=%s, error_description=%s, error_uri=%s", errorParam, errorDesc, errorURI)
			return ret, nil, fmt.Errorf("oauth error: %s - %s", errorParam, errorDesc)
		}

		// Convert form values to map
		tokenResponse = make(map[string]interface{})
		for k, v := range values {
			if len(v) > 0 {
				tokenResponse[k] = v[0]
			}
		}
		log.GetLogger().Debugf("Parsed form-encoded token response. Keys: %v", getMapKeys(tokenResponse))
	} else {
		// Try to parse as JSON
		if err := json.Unmarshal(body, &tokenResponse); err != nil {
			log.GetLogger().Warnf("Failed to parse token response as JSON. Status: %d, Content-Type: %s, Body: %s", resp.StatusCode, contentType, string(body))
			return ret, nil, fmt.Errorf("failed to parse token response: %w (response body: %s)", err, string(body))
		}
		log.GetLogger().Debugf("Parsed JSON token response. Keys: %v", getMapKeys(tokenResponse))

		// Check for errors in JSON response (some providers return JSON error responses)
		if errorParam, ok := tokenResponse["error"].(string); ok && errorParam != "" {
			errorDesc := ""
			if desc, ok := tokenResponse["error_description"].(string); ok {
				errorDesc = desc
			}
			errorURI := ""
			if uri, ok := tokenResponse["error_uri"].(string); ok {
				errorURI = uri
			}
			log.GetLogger().Warnf("OAuth provider returned error in JSON response: error=%s, error_description=%s, error_uri=%s", errorParam, errorDesc, errorURI)
			return ret, nil, fmt.Errorf("oauth error: %s - %s", errorParam, errorDesc)
		}
	}

	// Extract tokens
	if accessToken, ok := tokenResponse["access_token"].(string); ok {
		ret.AccessToken = accessToken
		log.GetLogger().Debugf("Extracted access_token (length: %d)", len(accessToken))
	} else {
		log.GetLogger().Warnf("access_token not found in token response. Available keys: %v", getMapKeys(tokenResponse))
	}

	if idToken, ok := tokenResponse["id_token"].(string); ok {
		ret.IDToken = idToken
		log.GetLogger().Debugf("Extracted id_token (length: %d)", len(idToken))
	}

	if refreshToken, ok := tokenResponse["refresh_token"].(string); ok {
		ret.RefreshToken = refreshToken
		log.GetLogger().Debugf("Extracted refresh_token (length: %d)", len(refreshToken))
	}

	// Extract expires_in
	expiresIn, err := getExpiresIn(osincli.ResponseData(tokenResponse))
	if err != nil {
		return ret, nil, fmt.Errorf("failed to parse expires_in: %w", err)
	}

	return ret, expiresIn, nil
}

// refreshOAuthToken refreshes an access token using a refresh token
func refreshOAuthToken(refreshToken string, client *osincli.Client) (TokenData, *int64, error) {
	req := client.NewAccessRequest(osincli.REFRESH_TOKEN, &osincli.AuthorizeData{Code: refreshToken})
	return executeOAuthFlow(req)
}

// loginRedirect generates the OAuth login redirect URL with provider state and PKCE parameters
// If codeChallenge is empty, it will be generated automatically
func loginRedirect(client *osincli.Client, providerName string, codeChallenge string) string {
	authorizeRequest := client.NewAuthorizeRequest(osincli.CODE)
	authURL := authorizeRequest.GetAuthorizeUrl()

	// Log the redirect_uri used in authorization request for debugging
	parsedAuthURL, _ := url.Parse(authURL.String())
	redirectURI := parsedAuthURL.Query().Get("redirect_uri")
	if redirectURI == "" {
		redirectURI = config.BaseUiUrl + "/callback"
	}
	log.GetLogger().Infof("Authorization request for provider %s: redirect_uri=%s", providerName, redirectURI)

	// Include provider name in state parameter so callback can identify which provider to use
	// Format: "provider:<providerName>"
	// NOTE: We do NOT encode code_verifier in state for security reasons.
	// The verifier is stored securely in an HttpOnly cookie instead.
	state := fmt.Sprintf("provider:%s", providerName)

	// Parse the URL and add state parameter
	parsedURL, err := url.Parse(authURL.String())
	if err != nil {
		return authURL.String()
	}

	// Add state to query parameters
	query := parsedURL.Query()
	query.Set("state", state)

	// PKCE is required - codeChallenge must be provided
	if codeChallenge == "" {
		log.GetLogger().Error("PKCE code_challenge is required but not provided - this should not happen")
	}

	// Add PKCE parameters (required)
	query.Set("code_challenge", codeChallenge)
	query.Set("code_challenge_method", "S256")

	parsedURL.RawQuery = query.Encode()

	return parsedURL.String()
}

// executeOAuthFlow executes the OAuth token exchange flow
func executeOAuthFlow(req *osincli.AccessRequest) (TokenData, *int64, error) {
	ret := TokenData{}
	// Exchange refresh token for a new access token
	accessData, err := req.GetToken()
	if err != nil {
		return ret, nil, fmt.Errorf("failed to refresh token: %w", err)
	}

	expiresIn, err := getExpiresIn(accessData.ResponseData)
	if err != nil {
		return ret, nil, fmt.Errorf("failed to refresh token: %w", err)
	}

	// Always store the access_token
	ret.AccessToken = accessData.AccessToken

	// For OIDC flows, check if id_token is present in the response
	// OIDC providers return both access_token and id_token:
	// - id_token (JWT) is used for API authentication
	// - access_token (opaque) is used for userinfo endpoint
	if idTokenRaw, exists := accessData.ResponseData["id_token"]; exists {
		if idToken, ok := idTokenRaw.(string); ok && idToken != "" {
			ret.IDToken = idToken
		}
	}

	ret.RefreshToken = accessData.RefreshToken

	return ret, expiresIn, nil
}

// getExpiresIn extracts the expires_in value from OAuth response data
// Based on GetToken() from osincli which parses the expires_in to int32 that may overflow
func getExpiresIn(ret osincli.ResponseData) (*int64, error) {
	expires_in_raw, ok := ret["expires_in"]
	if ok {
		rv := reflect.ValueOf(expires_in_raw)
		switch rv.Kind() {
		case reflect.Float64:
			expiration := int64(rv.Float())
			return &expiration, nil
		case reflect.String:
			// if string convert to integer
			ei, err := strconv.ParseInt(rv.String(), 10, 64)
			if err != nil {
				return nil, err
			}
			return &ei, nil
		default:
			return nil, errors.New("invalid parameter value")
		}
	}
	return nil, nil
}

// buildScopeParam builds a space-separated scope string from provider scopes or default scopes
// If providerScopes is provided and non-empty, it uses those scopes.
// Otherwise, if defaultScopes is provided (as a space-separated string), it uses defaultScopes.
// Returns the space-separated scope string.
func buildScopeParam(providerScopes *[]string, defaultScopes string) string {
	// Use provider scopes if available and non-empty
	if providerScopes != nil && len(*providerScopes) > 0 {
		return strings.Join(*providerScopes, " ")
	}
	return defaultScopes
}

// getValueByPath extracts a value from a map using an array path (e.g., ["user", "name"])
// Path segments are used directly as map keys, so dots and other special characters
// are treated as literal characters (e.g., ["kubernetes.io", "some-field"] works correctly)
// Returns the value and whether it was found
func getValueByPath(data map[string]interface{}, path []string) (interface{}, bool) {
	if len(path) == 0 {
		return nil, false
	}

	current := data

	for i, part := range path {
		if i == len(path)-1 {
			// Last part - extract the value
			if value, exists := current[part]; exists {
				return value, true
			}
			return nil, false
		}

		// Navigate deeper into the object
		if next, exists := current[part]; exists {
			if nextMap, ok := next.(map[string]interface{}); ok {
				current = nextMap
			} else {
				return nil, false
			}
		} else {
			return nil, false
		}
	}

	return nil, false
}

// getMapKeys returns the keys of a map as a slice of strings
func getMapKeys(m map[string]interface{}) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}

// extractProviderName extracts the provider name from AuthProvider metadata
func extractProviderName(provider *v1beta1.AuthProvider) string {
	if provider != nil && provider.Metadata.Name != nil {
		return *provider.Metadata.Name
	}
	return ""
}

// PKCE cookie name prefix
const pkceCookiePrefix = "pkce_verifier_"

// generateCodeVerifier generates a cryptographically random code verifier
// Returns a base64url-encoded string of 32 random bytes (43-128 characters per RFC 7636)
func generateCodeVerifier() (string, error) {
	// Generate 32 random bytes
	randomBytes := make([]byte, 32)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", fmt.Errorf("failed to generate random bytes: %w", err)
	}

	// Base64URL encode (RFC 4648 Section 5)
	// Replace '+' with '-', '/' with '_', and remove padding '='
	encoded := b64.URLEncoding.WithPadding(b64.NoPadding).EncodeToString(randomBytes)
	return encoded, nil
}

// generateCodeChallenge generates a code challenge from a code verifier using SHA-256
// Returns a base64url-encoded SHA-256 hash of the verifier
func generateCodeChallenge(codeVerifier string) string {
	// SHA-256 hash of the code verifier
	hash := sha256.Sum256([]byte(codeVerifier))
	// Base64URL encode without padding
	return b64.URLEncoding.WithPadding(b64.NoPadding).EncodeToString(hash[:])
}

// setPKCEVerifierCookie stores the code verifier in a cookie
func setPKCEVerifierCookie(w http.ResponseWriter, providerName string, codeVerifier string) {
	cookieName := pkceCookiePrefix + providerName
	cookie := http.Cookie{
		Name:     cookieName,
		Value:    codeVerifier,
		Secure:   config.TlsCertPath != "",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode, // Use Lax instead of Strict to allow cookie on redirect from OAuth provider
		Path:     "/",
		MaxAge:   600, // 10 minutes (same as authorization code expiration)
		// Don't set Domain - let browser use default (current domain)
	}
	http.SetCookie(w, &cookie)
	log.GetLogger().Infof("Set PKCE verifier cookie for provider %s (cookie: %s, value length: %d, secure: %v, path: %s, sameSite: %v)",
		providerName, cookieName, len(codeVerifier), cookie.Secure, cookie.Path, cookie.SameSite)
}

// getPKCEVerifierCookie retrieves the code verifier from a cookie
func getPKCEVerifierCookie(r *http.Request, providerName string) (string, error) {
	cookieName := pkceCookiePrefix + providerName

	// Log all cookies for debugging
	allCookies := r.Cookies()
	cookieNames := make([]string, len(allCookies))
	for i, c := range allCookies {
		cookieNames[i] = c.Name
	}
	log.GetLogger().Infof("Looking for PKCE cookie %s. Available cookies: %v (total: %d). Request host: %s, request path: %s, request method: %s",
		cookieName, cookieNames, len(allCookies), r.Host, r.URL.Path, r.Method)

	cookie, err := r.Cookie(cookieName)
	if err != nil {
		if errors.Is(err, http.ErrNoCookie) {
			log.GetLogger().Warnf("PKCE verifier cookie not found: %s (this will cause token exchange to fail)", cookieName)
			return "", nil
		}
		return "", err
	}
	if cookie.Value == "" {
		log.GetLogger().Warnf("PKCE verifier cookie is empty: %s", cookieName)
		return "", nil
	}
	log.GetLogger().Debugf("Found PKCE verifier cookie for provider %s (length: %d)", providerName, len(cookie.Value))
	return cookie.Value, nil
}

// clearPKCEVerifierCookie removes the PKCE verifier cookie
func clearPKCEVerifierCookie(w http.ResponseWriter, providerName string) {
	cookieName := pkceCookiePrefix + providerName
	cookie := http.Cookie{
		Name:     cookieName,
		Value:    "",
		MaxAge:   -1,
		Path:     "/",
		Secure:   config.TlsCertPath != "",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode, // Use Lax to match the set cookie
	}
	http.SetCookie(w, &cookie)
}

// clearSessionCookie removes the session cookie
func clearSessionCookie(w http.ResponseWriter, r *http.Request) {
	// TODO EDM-2612 Setting cookie here was not working, removed the code - needs to be investigated.
	// Set Clear-Site-Data header to instruct browser to clear cookies
	w.Header().Set("Clear-Site-Data", `"cookies"`)
}

// extractProviderNameFromState extracts provider name from state parameter
// State format: "provider:<providerName>"
// NOTE: We no longer embed code_verifier in state for security reasons
func extractProviderNameFromState(state string) string {
	prefix := "provider:"
	if !strings.HasPrefix(state, prefix) {
		return ""
	}
	// Extract just the provider name (everything after "provider:")
	providerName := strings.TrimPrefix(state, prefix)
	// If there was a verifier encoded (legacy format with ":"), take only the first part
	if idx := strings.Index(providerName, ":"); idx > 0 {
		providerName = providerName[:idx]
	}
	return providerName
}
