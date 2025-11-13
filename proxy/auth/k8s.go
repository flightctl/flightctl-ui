package auth

import (
	"crypto/tls"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/flightctl/flightctl-ui/bridge"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
	"github.com/lestrrat-go/jwx/v2/jwt"
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

	// Verify that the token is valid for the Flight Control API
	validateUrl := config.FctlApiUrl + "/api/v1/auth/validate"

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

	// Accept only successful responses
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
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
	parsedToken, err := jwt.ParseInsecure([]byte(token))
	if err != nil {
		return nil
	}

	exp, exists := parsedToken.Get("exp")
	if !exists {
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

// extractUsernameFromClaims extracts the username from JWT claims
func extractUsernameFromClaims(parsedToken jwt.Token) (string, bool) {
	// Prefer the short service account name over the full sub claim
	if k8sInfo, exists := parsedToken.Get("kubernetes.io"); exists {
		if k8sInfoMap, ok := k8sInfo.(map[string]interface{}); ok {
			if sa, ok := k8sInfoMap["serviceaccount"].(map[string]interface{}); ok {
				if saName, ok := sa["name"].(string); ok && saName != "" {
					return saName, true
				}
			}
		}
	}

	// Try to extract the service account name from the old flat claim structure
	if saName, exists := parsedToken.Get("kubernetes.io/serviceaccount/service-account.name"); exists {
		if saNameStr, ok := saName.(string); ok && saNameStr != "" {
			return saNameStr, true
		}
	}

	// Fallback to sub claim (which contains the full system:serviceaccount:namespace:name format)
	if username, exists := parsedToken.Get("sub"); exists {
		if usernameStr, ok := username.(string); ok && usernameStr != "" {
			// Try to extract just the service account name from sub if it's in the right format
			parts := strings.Split(usernameStr, ":")
			if len(parts) == 4 && parts[0] == "system" && parts[1] == "serviceaccount" {
				return parts[3], true // Return just the service account name
			}
			return usernameStr, true
		}
	}

	return "", false
}

// ExtractUsernameFromToken extracts the username from a K8s JWT token
func ExtractUsernameFromToken(token string) (string, error) {
	// Parse the token without signature validation (we only need to extract claims)
	parsedToken, err := jwt.ParseInsecure([]byte(token))
	if err != nil {
		return "", fmt.Errorf("failed to parse JWT token: %w", err)
	}

	username, ok := extractUsernameFromClaims(parsedToken)
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

	// Check if token is expired
	expiresIn := extractTokenExpiration(token)
	if expiresIn != nil && *expiresIn == 0 {
		resp := &http.Response{
			StatusCode: http.StatusUnauthorized,
		}
		return "", resp, fmt.Errorf("token has expired")
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
