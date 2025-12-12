package auth

import (
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/flightctl/flightctl-ui/common"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
	"github.com/flightctl/flightctl/api/v1beta1"
)

type ExpiresInResp struct {
	ExpiresIn *int64 `json:"expiresIn"`
}

type UserInfoResponse struct {
	Username string `json:"username,omitempty"`
}

type RedirectResponse struct {
	Url string `json:"url"`
}

// UserInfoError is a custom error type that carries a user-facing error message
type UserInfoError struct {
	UserMessage string
	Err         error
}

func (e *UserInfoError) Error() string {
	if e.UserMessage != "" {
		return e.UserMessage
	}
	if e.Err != nil {
		return e.Err.Error()
	}
	return "userinfo error"
}

func (e *UserInfoError) Unwrap() error {
	return e.Err
}

type AuthHandler struct {
	provider       AuthProvider
	apiTlsConfig   *tls.Config
	authConfigData *v1beta1.AuthConfig
}

func NewAuth(apiTlsConfig *tls.Config) (*AuthHandler, error) {
	auth := AuthHandler{
		apiTlsConfig: apiTlsConfig,
	}
	authConfig, err := getAuthInfo(apiTlsConfig)
	if err != nil {
		return nil, err
	}

	if authConfig == nil {
		return nil, fmt.Errorf("Auth config is missing")
	}

	// Store the full auth config for later use
	auth.authConfigData = authConfig

	return &auth, nil
}

// findProviderConfig finds a provider config by name from the auth config
func findProviderConfig(authConfig *v1beta1.AuthConfig, providerName string) (*v1beta1.AuthProvider, error) {
	if authConfig == nil || authConfig.Providers == nil {
		return nil, fmt.Errorf("no providers configured")
	}

	for i, pc := range *authConfig.Providers {
		if pc.Metadata.Name != nil && *pc.Metadata.Name == providerName {
			return &(*authConfig.Providers)[i], nil
		}
	}

	return nil, fmt.Errorf("provider not found: %s", providerName)
}

// getProviderInstance creates a provider instance by fetching the latest auth config
// Returns both the provider instance and the provider config to avoid duplicate API calls
func (a *AuthHandler) getProviderInstance(providerName string) (AuthProvider, *v1beta1.AuthProvider, error) {
	authConfig, err := getAuthInfo(a.apiTlsConfig)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get auth config: %w", err)
	}

	providerConfig, err := findProviderConfig(authConfig, providerName)
	if err != nil {
		return nil, nil, err
	}

	// Get the provider type from the spec discriminator
	providerTypeStr, err := providerConfig.Spec.Discriminator()
	if err != nil {
		return nil, nil, fmt.Errorf("failed to determine provider type for %s: %w", providerName, err)
	}

	// Create provider based on type
	var provider AuthProvider

	switch providerTypeStr {
	case ProviderTypeOpenShift:
		openshiftSpec, err := providerConfig.Spec.AsOpenShiftProviderSpec()
		if err != nil {
			return nil, nil, fmt.Errorf("failed to parse OpenShift provider spec for %s: %w", providerName, err)
		}
		openshiftHandler, err := getOpenShiftAuthHandlerFromSpec(providerConfig, &openshiftSpec)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to create OpenShift provider %s: %w", providerName, err)
		}
		provider = openshiftHandler
	case ProviderTypeK8s:
		k8sSpec, err := providerConfig.Spec.AsK8sProviderSpec()
		if err != nil {
			return nil, nil, fmt.Errorf("failed to parse K8s provider spec for %s: %w", providerName, err)
		}
		// This is regular k8s token auth
		provider, err = getK8sAuthHandler(providerConfig, &k8sSpec)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to create K8s provider %s: %w", providerName, err)
		}
	case ProviderTypeOIDC:
		oidcSpec, err := providerConfig.Spec.AsOIDCProviderSpec()
		if err != nil {
			return nil, nil, fmt.Errorf("failed to parse OIDC provider spec for %s: %w", providerName, err)
		}
		oidcHandler, err := getOIDCAuthHandler(providerConfig, &oidcSpec)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to create OIDC provider %s: %w", providerName, err)
		}
		provider = oidcHandler
	case ProviderTypeAAP:
		aapSpec, err := providerConfig.Spec.AsAapProviderSpec()
		if err != nil {
			return nil, nil, fmt.Errorf("failed to parse AAP provider spec for %s: %w", providerName, err)
		}
		aapHandler, err := getAAPAuthHandler(providerConfig, &aapSpec)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to create AAP provider %s: %w", providerName, err)
		}
		provider = aapHandler
	case ProviderTypeOAuth2:
		oauth2Spec, err := providerConfig.Spec.AsOAuth2ProviderSpec()
		if err != nil {
			return nil, nil, fmt.Errorf("failed to parse OAuth2 provider spec for %s: %w", providerName, err)
		}
		oauth2Handler, err := getOAuth2AuthHandler(providerConfig, &oauth2Spec)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to create OAuth2 provider %s: %w", providerName, err)
		}
		provider = oauth2Handler
	default:
		return nil, nil, fmt.Errorf("unknown provider type: %s for provider: %s", providerTypeStr, providerName)
	}

	return provider, providerConfig, nil
}

// getClientIdFromProviderConfig extracts the client_id from a provider config
func getClientIdFromProviderConfig(providerConfig *v1beta1.AuthProvider) (string, error) {
	providerTypeStr, err := providerConfig.Spec.Discriminator()
	if err != nil {
		return "", fmt.Errorf("failed to determine provider type: %w", err)
	}

	switch providerTypeStr {
	case ProviderTypeOIDC:
		oidcSpec, err := providerConfig.Spec.AsOIDCProviderSpec()
		if err != nil {
			return "", fmt.Errorf("failed to parse OIDC provider spec: %w", err)
		}
		return oidcSpec.ClientId, nil
	case ProviderTypeOAuth2:
		oauth2Spec, err := providerConfig.Spec.AsOAuth2ProviderSpec()
		if err != nil {
			return "", fmt.Errorf("failed to parse OAuth2 provider spec: %w", err)
		}
		return oauth2Spec.ClientId, nil
	case ProviderTypeAAP:
		aapSpec, err := providerConfig.Spec.AsAapProviderSpec()
		if err != nil {
			return "", fmt.Errorf("failed to parse AAP provider spec: %w", err)
		}
		if aapSpec.ClientId == "" {
			return "", fmt.Errorf("AAP provider missing required ClientId")
		}
		return aapSpec.ClientId, nil
	case ProviderTypeOpenShift:
		openshiftSpec, err := providerConfig.Spec.AsOpenShiftProviderSpec()
		if err != nil {
			return "", fmt.Errorf("failed to parse OpenShift provider spec: %w", err)
		}
		if openshiftSpec.ClientId == nil || *openshiftSpec.ClientId == "" {
			return "", fmt.Errorf("OpenShift provider missing required ClientId")
		}
		return *openshiftSpec.ClientId, nil
	case ProviderTypeK8s:
		// Regular K8s token providers don't use this endpoint
		return "", fmt.Errorf("K8s token providers don't use token exchange endpoint")
	default:
		return "", fmt.Errorf("unknown provider type: %s", providerTypeStr)
	}
}

// isProviderWithCustomerToken determines if a provider uses customer-provided tokens (K8s)
func isProviderWithCustomerToken(provider AuthProvider) bool {
	if _, ok := provider.(*TokenAuthProvider); ok {
		return true
	}
	return false
}

// handleTokenProviderLogin handles login for token-based auth providers (K8s)
func handleTokenProviderLogin(w http.ResponseWriter, r *http.Request, tokenProvider *TokenAuthProvider, providerName string) bool {
	var loginParams TokenLoginParameters
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return false
	}

	err = json.Unmarshal(body, &loginParams)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return false
	}

	if loginParams.Token == "" {
		w.WriteHeader(http.StatusBadRequest)
		return false
	}

	tokenData, expires, err := tokenProvider.ValidateToken(loginParams.Token)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, err.Error())
		return false
	}

	tokenData.Provider = providerName
	respondWithToken(w, tokenData, expires)
	return true
}

func (a AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	// For GET requests, extract provider from query parameter
	var provider AuthProvider
	var err error
	if r.Method == http.MethodGet {
		providerName := r.URL.Query().Get("provider")
		if !common.IsSafeResourceName(providerName) {
			respondWithError(w, http.StatusBadRequest, "Invalid authentication provider")
			return
		}

		provider, _, err = a.getProviderInstance(providerName)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid authentication provider: %s", providerName))
			return
		}

		// Check if this is a token-based auth provider (k8s) - token providers don't use PKCE flow
		if _, ok := provider.(*TokenAuthProvider); ok {
			// Token providers don't need a redirect URL - they handle login via POST with token
			loginUrl := provider.GetLoginRedirectURL("", "")
			response, err := json.Marshal(RedirectResponse{Url: loginUrl})
			if err != nil {
				log.GetLogger().WithError(err).Warn("Failed to marshal response")
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			w.Write(response)
			return
		}

		// Generate PKCE parameters (code verifier and challenge)
		// PKCE is required - fail if generation fails
		codeVerifier, err := generateCodeVerifier()
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to initialize PKCE authentication flow")
			return
		}

		codeChallenge := generateCodeChallenge(codeVerifier)

		// Generate random state for CSRF protection
		state, err := generateState()
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to initialize authentication flow")
			return
		}

		// Store code verifier in cookie for later use during token exchange
		setPKCEVerifierCookie(w, providerName, codeVerifier)

		// Store state → providerName mapping in secure cookie for validation on callback
		setStateCookie(w, state, providerName)

		// Generate login URL with random state and PKCE challenge
		loginUrl := provider.GetLoginRedirectURL(state, codeChallenge)
		response, err := json.Marshal(RedirectResponse{Url: loginUrl})
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		w.Write(response)
	} else if r.Method == http.MethodPost {
		// Token providers pass provider in query param, not state
		providerNameFromQuery := r.URL.Query().Get("provider")
		if providerNameFromQuery != "" && common.IsSafeResourceName(providerNameFromQuery) {
			provider, _, err := a.getProviderInstance(providerNameFromQuery)
			if err == nil && isProviderWithCustomerToken(provider) {
				// Handle token provider login immediately and return
				tokenProvider := provider.(*TokenAuthProvider)
				handleTokenProviderLogin(w, r, tokenProvider, providerNameFromQuery)
				return
			}
		}

		// OAuth flow: validate state parameter for CSRF protection
		state := r.URL.Query().Get("state")
		if state == "" {
			respondWithError(w, http.StatusBadRequest, "Missing state parameter for Oauth flow")
			return
		}

		// Validate state and extract provider name from secure cookie mapping
		providerName, err := validateAndExtractProviderFromState(r, state)
		if err != nil {
			log.GetLogger().WithError(err).Warnf("State validation failed")
			respondWithError(w, http.StatusBadRequest, "Invalid state parameter - possible CSRF attack or expired state")
			return
		}

		var providerConfig *v1beta1.AuthProvider
		provider, providerConfig, err = a.getProviderInstance(providerName)
		if err != nil {
			respondWithError(w, http.StatusBadRequest, fmt.Sprintf("Invalid authentication provider: %s", providerName))
			return
		}

		// Flow for all providers except K8s token providers
		body, err := io.ReadAll(r.Body)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		loginParams := LoginParameters{}
		err = json.Unmarshal(body, &loginParams)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		// Clear state cookie after validation (success or failure)
		clearStateCookie(w, state)

		// PKCE is required - retrieve code_verifier from cookie
		if loginParams.CodeVerifier == "" {
			codeVerifier, err := getPKCEVerifierCookie(r, providerName)
			if err != nil {
				log.GetLogger().WithError(err).Warnf("Failed to get PKCE verifier from cookie for provider %s", providerName)
			} else if codeVerifier != "" {
				loginParams.CodeVerifier = codeVerifier
			}
		}

		// PKCE is required - fail if code_verifier is missing
		if loginParams.CodeVerifier == "" {
			respondWithError(w, http.StatusBadRequest, "PKCE code verifier is required but not found. Please restart the login flow.")
			return
		}

		// Clear PKCE verifier cookie after use (success or failure)
		// Note: state cookie was already cleared above after validation
		clearPKCEVerifierCookie(w, providerName)

		clientId, err := getClientIdFromProviderConfig(providerConfig)
		if err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to obtain the configuration details for provider")
			return
		}

		redirectURI := config.BaseUiUrl + "/callback"
		tokenReq := &v1beta1.TokenRequest{
			GrantType:    v1beta1.AuthorizationCode,
			ClientId:     clientId,
			Code:         &loginParams.Code,
			CodeVerifier: &loginParams.CodeVerifier,
			RedirectUri:  &redirectURI,
		}

		tokenResp, err := exchangeTokenWithApiServer(a.apiTlsConfig, providerConfig, tokenReq)
		if err != nil {
			handleOAuthErrorResponse(w, tokenResp, "Failed to obtain login authorization code")
			return
		}

		tokenData, expiresIn := convertTokenResponseToTokenData(tokenResp, providerConfig)
		respondWithToken(w, tokenData, expiresIn)
	} else {
		respondWithError(w, http.StatusMethodNotAllowed, "Method not allowed")
	}
}

func (a AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	tokenData, err := ParseSessionCookie(r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Validate provider name from cookie to prevent SSRF attacks
	if !common.IsSafeResourceName(tokenData.Provider) {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Get provider to determine routing
	var providerConfig *v1beta1.AuthProvider
	provider, providerConfig, err := a.getProviderInstance(tokenData.Provider)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if isProviderWithCustomerToken(provider) {
		respondWithError(w, http.StatusBadRequest, "Token refresh not supported for K8s token providers")
		return
	}

	if tokenData.RefreshToken == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	clientId, err := getClientIdFromProviderConfig(providerConfig)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	tokenReq := &v1beta1.TokenRequest{
		GrantType:    v1beta1.RefreshToken,
		ClientId:     clientId,
		RefreshToken: &tokenData.RefreshToken,
	}

	tokenResp, err := exchangeTokenWithApiServer(a.apiTlsConfig, providerConfig, tokenReq)
	if err != nil {
		handleOAuthErrorResponse(w, tokenResp, "Failed to obtain new access token")
		return
	}

	// Convert backend response to TokenData
	newTokenData, expiresIn := convertTokenResponseToTokenData(tokenResp, providerConfig)
	respondWithToken(w, newTokenData, expiresIn)
}

// handleOAuthErrorResponse handles OAuth2 error responses from token exchange/refresh
func handleOAuthErrorResponse(w http.ResponseWriter, tokenResp *v1beta1.TokenResponse, defaultMessage string) {
	if tokenResp != nil && tokenResp.Error != nil {
		errorDesc := ""
		if tokenResp.ErrorDescription != nil {
			errorDesc = *tokenResp.ErrorDescription
		}
		respondWithError(w, http.StatusBadRequest, fmt.Sprintf("OAuth2 error: %s - %s", *tokenResp.Error, errorDesc))
	} else {
		respondWithError(w, http.StatusInternalServerError, defaultMessage)
	}
}

func respondWithToken(w http.ResponseWriter, tokenData TokenData, expires *int64) {
	err := setCookie(w, tokenData)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	exp, err := json.Marshal(ExpiresInResp{ExpiresIn: expires})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(exp)
}

func (a AuthHandler) GetUserInfo(w http.ResponseWriter, r *http.Request) {
	tokenData, err := ParseSessionCookie(r)
	if err != nil {
		clearSessionCookie(w, r)
		respondWithError(w, http.StatusUnauthorized, "Invalid or missing session cookie")
		return
	}

	// If no provider specified, clear the cookie and force a new login
	if tokenData.Provider == "" {
		clearSessionCookie(w, r)
		respondWithError(w, http.StatusUnauthorized, "No authentication provider specified in session")
		return
	}

	token := tokenData.Token
	if token == "" {
		clearSessionCookie(w, r)
		respondWithError(w, http.StatusUnauthorized, "No authentication token found in session")
		return
	}

	// Route ALL providers to API server userinfo endpoint
	username, err := getUserInfoFromApiServer(a.apiTlsConfig, token)
	if err != nil {
		// If user info retrieval fails (including timeouts), treat as authentication failure
		clearSessionCookie(w, r)

		// Extract the user-facing error message
		errorMsg := extractUserInfoErrorMessage(err)
		respondWithError(w, http.StatusUnauthorized, errorMsg)
		return
	}

	if username == "" {
		respondWithError(w, http.StatusInternalServerError, "Failed to retrieve user details")
		return
	}

	a.respondWithUserInfo(w, username)
}

// respondWithUserInfo is a helper to send the UserInfoResponse
func (a AuthHandler) respondWithUserInfo(w http.ResponseWriter, username string) {
	userInfo := UserInfoResponse{Username: username}
	res, err := json.Marshal(userInfo)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(res)
}

func (a AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	tokenData, err := ParseSessionCookie(r)
	if err != nil {
		// No valid session, but still clear cookies and return success
		clearSessionCookie(w, r)
		response, _ := json.Marshal(RedirectResponse{})
		w.Write(response)
		return
	}

	var redirectUrl string

	// If we have a provider, call its Logout method
	if tokenData.Provider != "" {
		authToken := tokenData.Token
		if authToken == "" {
			// No valid session, but still clear cookies and return success
			clearSessionCookie(w, r)
			response, _ := json.Marshal(RedirectResponse{})
			w.Write(response)
			return
		}

		provider, _, err := a.getProviderInstance(tokenData.Provider)
		if err == nil {
			redirectUrl, err = provider.Logout(authToken)
			if err != nil {
				log.GetLogger().WithError(err).Warn("Failed to logout from provider")
			}
		}
	}

	// In any case, we proceed to clear the cookies
	clearSessionCookie(w, r)
	redirectResp := RedirectResponse{}
	if redirectUrl != "" {
		redirectResp.Url = redirectUrl
	}
	response, err := json.Marshal(redirectResp)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(response)
}

func getAuthInfo(apiTlsConfig *tls.Config) (*v1beta1.AuthConfig, error) {
	client := &http.Client{Transport: &http.Transport{
		TLSClientConfig: apiTlsConfig,
	}}
	authConfigUrl, err := common.BuildFctlApiUrl("api/v1/auth/config")
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(http.MethodGet, authConfigUrl, nil)
	if err != nil {
		return nil, err
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	authConfig := &v1beta1.AuthConfig{}
	err = json.Unmarshal(body, authConfig)
	if err != nil {
		return nil, err
	}

	return authConfig, nil
}

// extractUserInfoErrorMessage extracts a user-facing error message from an error
func extractUserInfoErrorMessage(err error) string {
	if err == nil {
		return "Unknown error"
	}

	// Check if it's a UserInfoError with a user message
	var userInfoErr *UserInfoError
	if errors.As(err, &userInfoErr) && userInfoErr.UserMessage != "" {
		return userInfoErr.UserMessage
	}

	// Fallback: return a generic error message
	return "Authentication failed. Please try logging in again."
}
