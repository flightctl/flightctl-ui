package auth

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
)

// ApiTokenRequest represents the token request to the API server
type ApiTokenRequest struct {
	GrantType    string  `json:"grant_type"`
	ProviderName string  `json:"provider_name"`
	ClientId     string  `json:"client_id"`
	Code         *string `json:"code,omitempty"`
	CodeVerifier *string `json:"code_verifier,omitempty"`
	RefreshToken *string `json:"refresh_token,omitempty"`
	Scope        *string `json:"scope,omitempty"`
}

// ApiTokenResponse represents the token response from the API server
type ApiTokenResponse struct {
	AccessToken      *string `json:"access_token,omitempty"`
	RefreshToken     *string `json:"refresh_token,omitempty"`
	ExpiresIn        *int64  `json:"expires_in,omitempty"`
	TokenType        *string `json:"token_type,omitempty"`
	Error            *string `json:"error,omitempty"`
	ErrorDescription *string `json:"error_description,omitempty"`
}

// ApiUserInfoResponse represents the OIDC UserInfo response from the API server
type ApiUserInfoResponse struct {
	Sub               *string `json:"sub,omitempty"`
	PreferredUsername *string `json:"preferred_username,omitempty"`
	Name              *string `json:"name,omitempty"`
	Organizations     *[]struct {
		Metadata struct {
			Name *string `json:"name,omitempty"`
		} `json:"metadata,omitempty"`
		Spec *struct {
			DisplayName *string `json:"displayName,omitempty"`
			ExternalId  *string `json:"externalId,omitempty"`
		} `json:"spec,omitempty"`
	} `json:"organizations,omitempty"`
	Error *string `json:"error,omitempty"`
}

// k8s service account prefix
const k8sServiceAccountPrefix = "system:serviceaccount:"

// exchangeTokenWithApiServer allows us to perform the token exchange through the Flight Control API
func exchangeTokenWithApiServer(apiTlsConfig *tls.Config, tokenReq *ApiTokenRequest) (*ApiTokenResponse, error) {
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: apiTlsConfig,
		},
		Timeout: 30 * time.Second,
	}

	tokenURL := config.FctlApiUrl + "/api/v1/auth/" + tokenReq.ProviderName + "/token"

	// Marshal request body
	reqBody, err := json.Marshal(tokenReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal token request: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, tokenURL, bytes.NewReader(reqBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create token request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	// Log request details
	log.GetLogger().Infof("API server token request: method=%s, url=%s, grant_type=%s, provider_name=%s, client_id=%s, body=%s", req.Method, req.URL.String(), tokenReq.GrantType, tokenReq.ProviderName, tokenReq.ClientId, string(reqBody))

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call API server token endpoint: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read token response: %w", err)
	}

	// Log API server response for debugging
	log.GetLogger().Infof("API server token response: status=%d, content-type=%s, body=%s", resp.StatusCode, resp.Header.Get("Content-Type"), string(body))

	// Check HTTP status code first before trying to parse JSON
	if resp.StatusCode == http.StatusTeapot {
		// 418 indicates auth not configured
		return nil, fmt.Errorf("auth not configured")
	}

	if resp.StatusCode != http.StatusOK {
		// Try to parse as JSON first (OAuth2 errors are usually JSON)
		var tokenResp ApiTokenResponse
		if err := json.Unmarshal(body, &tokenResp); err == nil {
			// Successfully parsed as JSON, check for OAuth2 error fields
			if tokenResp.Error != nil {
				errorDesc := ""
				if tokenResp.ErrorDescription != nil {
					errorDesc = *tokenResp.ErrorDescription
				}
				return &tokenResp, fmt.Errorf("oauth2 error: %s - %s", *tokenResp.Error, errorDesc)
			}
			return &tokenResp, fmt.Errorf("API server returned status %d", resp.StatusCode)
		}
		// Not JSON, return the plain text error
		return nil, fmt.Errorf("API server returned status %d: %s", resp.StatusCode, string(body))
	}

	// Status is OK, parse as JSON
	var tokenResp ApiTokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return nil, fmt.Errorf("failed to parse API server token response: %w (body: %s)", err, string(body))
	}

	// Check for errors in response (even with 200 status)
	if tokenResp.Error != nil {
		errorDesc := ""
		if tokenResp.ErrorDescription != nil {
			errorDesc = *tokenResp.ErrorDescription
		}
		return &tokenResp, fmt.Errorf("oauth2 error: %s - %s", *tokenResp.Error, errorDesc)
	}

	return &tokenResp, nil
}

// getUserInfoFromApiServer allows us to get the user info from the Flight Control API
func getUserInfoFromApiServer(apiTlsConfig *tls.Config, token string) (string, error) {
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: apiTlsConfig,
		},
		Timeout: 30 * time.Second,
	}

	userInfoURL := config.FctlApiUrl + "/api/v1/auth/userinfo"

	req, err := http.NewRequest(http.MethodGet, userInfoURL, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create userinfo request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/json")

	// Log request details including Authorization header preview
	authHeader := req.Header.Get("Authorization")
	authHeaderPreview := ""
	if len(authHeader) > 60 {
		authHeaderPreview = authHeader[:60] + "..."
	} else {
		authHeaderPreview = authHeader
	}
	log.GetLogger().Infof("Backend userinfo request: method=%s, url=%s, token_length=%d, auth_header_preview=%s",
		req.Method, req.URL.String(), len(token), authHeaderPreview)

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to call backend userinfo endpoint: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read userinfo response: %w", err)
	}

	// Log backend response for debugging
	log.GetLogger().Infof("Backend userinfo response: status=%d, content-type=%s, body=%s", resp.StatusCode, resp.Header.Get("Content-Type"), string(body))

	// Check HTTP status code first before trying to parse JSON
	if resp.StatusCode == http.StatusTeapot {
		// 418 indicates auth not configured
		return "", fmt.Errorf("auth not configured")
	}

	if resp.StatusCode != http.StatusOK {
		// Try to parse as JSON first
		var userInfoResp ApiUserInfoResponse
		if err := json.Unmarshal(body, &userInfoResp); err == nil {
			// Successfully parsed as JSON, check for error field
			if userInfoResp.Error != nil {
				return "", fmt.Errorf("userinfo error: %s", *userInfoResp.Error)
			}
			return "", fmt.Errorf("backend returned status %d", resp.StatusCode)
		}
		// Not JSON, return the plain text error
		return "", fmt.Errorf("backend returned status %d: %s", resp.StatusCode, string(body))
	}

	// Status is OK, parse as JSON
	var userInfoResp ApiUserInfoResponse
	if err := json.Unmarshal(body, &userInfoResp); err != nil {
		return "", fmt.Errorf("failed to parse userinfo response: %w (body: %s)", err, string(body))
	}

	// Check for errors in response (even with 200 status)
	if userInfoResp.Error != nil {
		return "", fmt.Errorf("userinfo error: %s", *userInfoResp.Error)
	}

	// Extract and strip the k8s service account prefix from preferred_username if present
	if userInfoResp.PreferredUsername == nil {
		return "", fmt.Errorf("userinfo response missing preferred_username")
	}

	username := *userInfoResp.PreferredUsername
	if strings.HasPrefix(username, k8sServiceAccountPrefix) {
		username = strings.TrimPrefix(username, k8sServiceAccountPrefix)
	}

	return username, nil
}

// convertTokenResponseToTokenData converts ApiTokenResponse to proxy TokenData
func convertTokenResponseToTokenData(tokenResp *ApiTokenResponse, providerName string) (TokenData, *int64) {
	tokenData := TokenData{
		Provider: providerName,
	}

	if tokenResp.AccessToken != nil {
		tokenData.AccessToken = *tokenResp.AccessToken
		// For OIDC, if we don't have a separate id_token, use access_token as IDToken
		// The API server will return id_token in access_token field for OIDC if needed
		// For now, we'll set both - GetAuthToken() will prefer IDToken if present
		tokenData.IDToken = *tokenResp.AccessToken
	}

	if tokenResp.RefreshToken != nil {
		tokenData.RefreshToken = *tokenResp.RefreshToken
	}

	var expiresIn *int64
	if tokenResp.ExpiresIn != nil {
		expiresIn = tokenResp.ExpiresIn
	}

	return tokenData, expiresIn
}
