package auth

import (
	"crypto/tls"
	"fmt"
	"net/http"
	"time"

	"github.com/flightctl/flightctl-ui/bridge"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl/api/v1beta1"
	"github.com/lestrrat-go/jwx/v2/jwt"
)

type TokenAuthProvider struct {
	apiTlsConfig *tls.Config
	authURL      string
	providerName string
}

type TokenLoginParameters struct {
	Token string `json:"token"`
}

func NewTokenAuthProvider(apiTlsConfig *tls.Config, authURL string, providerName string) *TokenAuthProvider {
	return &TokenAuthProvider{
		apiTlsConfig: apiTlsConfig,
		authURL:      authURL,
		providerName: providerName,
	}
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

// Logout for token auth just clears the session
func (t *TokenAuthProvider) Logout(token string) (string, error) {
	// No special logout URL for token auth
	return "", nil
}

// GetLoginRedirectURL is not applicable for token auth
func (t *TokenAuthProvider) GetLoginRedirectURL(codeChallenge string) string {
	return ""
}

// getK8sAuthHandler creates a new K8s token authentication handler
func getK8sAuthHandler(provider *v1beta1.AuthProvider, k8sSpec *v1beta1.K8sProviderSpec) (*TokenAuthProvider, error) {
	providerName := extractProviderName(provider)

	// Use API TLS config since we're calling the FlightCtl API to validate tokens
	tlsConfig, err := bridge.GetTlsConfig()
	if err != nil {
		return nil, err
	}

	// For K8s token auth, we don't need authURL for the provider itself
	// The token validation happens against the FlightCtl API
	authURL := ""

	return NewTokenAuthProvider(tlsConfig, authURL, providerName), nil
}
