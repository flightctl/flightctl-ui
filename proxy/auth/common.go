package auth

import (
	"crypto/rand"
	"crypto/sha256"
	b64 "encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/flightctl/flightctl-ui/common"
	"github.com/flightctl/flightctl-ui/config"
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
	// Token is the authentication token to use for API calls
	//   - OIDC/K8s: IDToken (JWT)
	//   - OAuth2/AAP/OpenShift: AccessToken (opaque)
	Token        string `json:"token"`
	RefreshToken string `json:"refreshToken"`
	Provider     string `json:"provider,omitempty"`
}

type LoginParameters struct {
	Code         string `json:"code"`
	CodeVerifier string `json:"codeVerifier,omitempty"` // Optional, will be retrieved from cookie if not provided
}

type AuthProvider interface {
	Logout(token string) (string, error)
	GetLoginRedirectURL(codeChallenge string) string
}

func setCookie(w http.ResponseWriter, value TokenData) error {
	cookieVal, err := json.Marshal(value)
	if err != nil {
		return err
	}
	secure := config.TlsCertPath != ""
	encodedValue := b64.StdEncoding.EncodeToString(cookieVal)

	// Check cookie value size to ensure it doesn't exceed the maximum
	if len(encodedValue) > maxCookieValueSize {
		return fmt.Errorf("cookie value size (%d bytes) exceeds maximum allowed size (%d bytes)", len(encodedValue), maxCookieValueSize)
	}

	cookie := http.Cookie{
		Name:     common.CookieSessionName,
		Secure:   secure,
		Value:    encodedValue,
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
		return tokenData, err
	}

	if cookie != nil {
		val, err := b64.StdEncoding.DecodeString(cookie.Value)
		if err != nil {
			return tokenData, err
		}

		err = json.Unmarshal(val, &tokenData)
		if err != nil {
			return tokenData, err
		}
		return tokenData, err
	}
	return tokenData, nil
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
		return
	}
	w.Write(response)
}

// loginRedirect generates the OAuth login redirect URL with provider state and PKCE parameters
// If codeChallenge is empty, it will be generated automatically
func loginRedirect(client *osincli.Client, providerName string, codeChallenge string) string {
	authorizeRequest := client.NewAuthorizeRequest(osincli.CODE)
	authURL := authorizeRequest.GetAuthorizeUrl()

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

	// Add PKCE parameters (required)
	query.Set("code_challenge", codeChallenge)
	query.Set("code_challenge_method", "S256")

	parsedURL.RawQuery = query.Encode()

	return parsedURL.String()
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

// extractProviderName extracts the provider name from AuthProvider metadata
func extractProviderName(provider *v1beta1.AuthProvider) string {
	if provider != nil && provider.Metadata.Name != nil {
		return *provider.Metadata.Name
	}
	return ""
}

// PKCE cookie name prefix
const pkceCookiePrefix = "pkce_verifier_"

// maxCookieValueSize is the maximum size for a cookie value in bytes
// RFC 6265 specifies a maximum cookie size of 4096 bytes total.
// We use 4000 bytes for the value to leave room for cookie name and attributes.
const maxCookieValueSize = 4000

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
}

// getPKCEVerifierCookie retrieves the code verifier from a cookie
func getPKCEVerifierCookie(r *http.Request, providerName string) (string, error) {
	cookieName := pkceCookiePrefix + providerName

	cookie, err := r.Cookie(cookieName)
	if err != nil {
		if errors.Is(err, http.ErrNoCookie) {
			return "", nil
		}
		return "", err
	}
	if cookie.Value == "" {
		return "", nil
	}
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
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, &cookie)
}

// clearSessionCookie removes the session cookie
func clearSessionCookie(w http.ResponseWriter, r *http.Request) {
	cookie := http.Cookie{
		Name:     common.CookieSessionName,
		Value:    "",
		MaxAge:   -1,
		Path:     "/",
		Secure:   config.TlsCertPath != "",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, &cookie)

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
