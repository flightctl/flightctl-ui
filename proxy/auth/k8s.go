package auth

import (
	"crypto/tls"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/flightctl/flightctl-ui/bridge"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
)

type TokenAuthProvider struct {
	apiTlsConfig *tls.Config
	authURL      string
}

type TokenLoginParameters struct {
	Token string `json:"token"`
}

func NewTokenAuthProvider(apiTlsConfig *tls.Config, authURL string) *TokenAuthProvider {
	return &TokenAuthProvider{
		apiTlsConfig: apiTlsConfig,
		authURL:      authURL,
	}
}

// GetToken does not exist for token auth
func (t *TokenAuthProvider) GetToken(loginParams LoginParameters) (TokenData, *int64, error) {
	return TokenData{}, nil, fmt.Errorf("token auth does not use OAuth code flow")
}

// ValidateToken validates a K8s token by calling the backend API
func (t *TokenAuthProvider) ValidateToken(token string) (TokenData, *int64, error) {
	client := &http.Client{Transport: &http.Transport{
		TLSClientConfig: t.apiTlsConfig,
	}}

	// Call a basic API endpoint to validate the token
	validateUrl := config.FctlApiUrl + "/api/v1/fleets?limit=1"

	req, err := http.NewRequest(http.MethodGet, validateUrl, nil)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to create token validation request")
		return TokenData{}, nil, err
	}

	req.Header.Add("Authorization", "Bearer "+token)

	resp, err := client.Do(req)
	if err != nil {
		return TokenData{}, nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden {
		// Check if the token is expired by examining the exp claim
		expiresIn := extractTokenExpiration(token)
		if expiresIn != nil && *expiresIn == 0 {
			return TokenData{}, nil, fmt.Errorf("Token has expired")
		}
		return TokenData{}, nil, fmt.Errorf("Token is invalid or unauthorized")
	}

	// Accept any successful response (2xx) or even some 4xx errors that aren't auth-related
	if resp.StatusCode < 200 || resp.StatusCode >= 500 {
		return TokenData{}, nil, fmt.Errorf("Token validation failed")
	}

	// Store the validated K8s JWT token
	tokenData := TokenData{
		Token:        token,
		RefreshToken: "",
	}

	expiresIn := extractTokenExpiration(token)
	return tokenData, expiresIn, nil
}

// extractTokenExpiration extracts the expiration time from a JWT token
// Returns the number of seconds until expiration, or nil if no expiration is set
func extractTokenExpiration(token string) *int64 {
	claims, err := extractJwtTokenClaims(token)
	if err != nil {
		return nil
	}

	// Look for the "exp" claim (standard JWT expiration claim)
	exp, ok := claims["exp"]
	if !ok {
		return nil
	}

	// The exp claim is typically a float64 (Unix timestamp)
	var expTimestamp int64
	switch v := exp.(type) {
	case float64:
		expTimestamp = int64(v)
	case int64:
		expTimestamp = v
	case int:
		expTimestamp = int64(v)
	default:
		return nil
	}

	now := time.Now().Unix()
	expiresIn := expTimestamp - now

	if expiresIn < 0 {
		expiresIn = 0
	}

	return &expiresIn
}

// extractJwtTokenClaims extracts the claims from a JWT token
func extractJwtTokenClaims(token string) (map[string]interface{}, error) {
	// K8s tokens have the format: <header>.<payload>.<signature>
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("invalid token format")
	}

	// Decode the payload (second part)
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, fmt.Errorf("failed to decode token payload: %w", err)
	}

	// Parse the JSON payload
	var claims map[string]interface{}
	if err := json.Unmarshal(payload, &claims); err != nil {
		return nil, fmt.Errorf("failed to unmarshal token claims: %w", err)
	}

	return claims, nil
}

// extractUsernameFromClaims extracts the username from JWT claims
func extractUsernameFromClaims(claims map[string]interface{}) (string, bool) {
	// Prefer the short service account name over the full sub claim
	if k8sInfo, ok := claims["kubernetes.io"].(map[string]interface{}); ok {
		if sa, ok := k8sInfo["serviceaccount"].(map[string]interface{}); ok {
			if saName, ok := sa["name"].(string); ok && saName != "" {
				return saName, true
			}
		}
	}

	// Try to extract the service account name from the old flat claim structure
	if saName, ok := claims["kubernetes.io/serviceaccount/service-account.name"].(string); ok && saName != "" {
		return saName, true
	}

	// Fallback to sub claim (which contains the full system:serviceaccount:namespace:name format)
	if username, ok := claims["sub"].(string); ok && username != "" {
		// Try to extract just the service account name from sub if it's in the right format
		parts := strings.Split(username, ":")
		if len(parts) == 4 && parts[0] == "system" && parts[1] == "serviceaccount" {
			return parts[3], true // Return just the service account name
		}
		return username, true
	}

	return "", false
}

// ExtractUsernameFromToken extracts the username from a K8s JWT token
func ExtractUsernameFromToken(token string) (string, error) {
	claims, err := extractJwtTokenClaims(token)
	if err != nil {
		return "", err
	}

	username, ok := extractUsernameFromClaims(claims)
	if !ok {
		return "", fmt.Errorf("could not extract username from token claims")
	}

	return username, nil
}

// GetUserInfo retrieves user information from the provided JWT token
func (t *TokenAuthProvider) GetUserInfo(token string) (string, *http.Response, error) {
	// For K8s, extract username from the JWT token
	if token == "" {
		return "", nil, fmt.Errorf("token is required for K8s userinfo")
	}

	username, err := ExtractUsernameFromToken(token)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to extract username from token")
		return "", nil, err
	}

	resp := &http.Response{
		StatusCode: http.StatusOK,
	}

	return username, resp, nil
}

// RefreshToken is not applicable for K8s token auth
func (t *TokenAuthProvider) RefreshToken(refreshToken string) (TokenData, *int64, error) {
	return TokenData{}, nil, fmt.Errorf("token refresh not supported for K8s token auth")
}

// Logout for token auth just clears the session
func (t *TokenAuthProvider) Logout(token string) (string, error) {
	// No special logout URL for token auth
	return "", nil
}

// GetLoginRedirectURL is not applicable for token auth
func (t *TokenAuthProvider) GetLoginRedirectURL() string {
	return ""
}

// getK8sAuthHandler creates a new K8s token authentication handler
func getK8sAuthHandler(authURL string, internalAuthURL *string) (*TokenAuthProvider, error) {
	// Use API TLS config since we're calling the FlightCtl API to validate tokens
	tlsConfig, err := bridge.GetTlsConfig()
	if err != nil {
		return nil, err
	}

	url := authURL
	if internalAuthURL != nil {
		url = *internalAuthURL
	}

	return NewTokenAuthProvider(tlsConfig, url), nil
}
