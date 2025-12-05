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

	"github.com/flightctl/flightctl-ui/common"
	"github.com/flightctl/flightctl/api/v1beta1"
)

// k8s service account prefix
const k8sServiceAccountPrefix = "system:serviceaccount:"

// exchangeTokenWithApiServer allows us to perform the token exchange through the Flight Control API
func exchangeTokenWithApiServer(apiTlsConfig *tls.Config, providerName string, tokenReq *v1beta1.TokenRequest) (*v1beta1.TokenResponse, error) {
	// Validate provider name to prevent SSRF attacks
	if !common.IsSafeResourceName(providerName) {
		return nil, fmt.Errorf("invalid provider name: %s", providerName)
	}

	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: apiTlsConfig,
		},
		Timeout: 30 * time.Second,
	}

	tokenURL, err := common.BuildFctlApiUrl("api/v1/auth", providerName, "token")
	if err != nil {
		return nil, fmt.Errorf("failed to construct token URL: %w", err)
	}

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

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call API server token endpoint: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read token response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		// Try to parse as JSON first (OAuth2 errors are usually JSON)
		var tokenResp v1beta1.TokenResponse
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
	var tokenResp v1beta1.TokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return nil, fmt.Errorf("failed to parse API server token response: %w", err)
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

	userInfoURL, err := common.BuildFctlApiUrl("api/v1/auth/userinfo")
	if err != nil {
		return "", &UserInfoError{UserMessage: "Unable to reach userinfo service.", Err: err}
	}

	req, err := http.NewRequest(http.MethodGet, userInfoURL, nil)
	if err != nil {
		return "", &UserInfoError{UserMessage: "Unable to reach userinfo service.", Err: err}
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return "", &UserInfoError{UserMessage: "Unable to reach userinfo service.", Err: err}
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", &UserInfoError{UserMessage: "Invalid response from userinfo service.", Err: err}
	}

	// Check if response is a Kubernetes Status error object (can occur with any HTTP status)
	// Status objects have: kind="Status", status="Failure", message, code, etc.
	var statusObj struct {
		Kind    string `json:"kind"`
		Status  string `json:"status"`
		Message string `json:"message"`
		Code    int32  `json:"code"`
		Reason  string `json:"reason"`
	}
	if err := json.Unmarshal(body, &statusObj); err == nil {
		// Successfully parsed, check if it's a Status object with Failure status
		if statusObj.Kind == "Status" && statusObj.Status == "Failure" {
			errorMsg := statusObj.Message
			if errorMsg == "" {
				errorMsg = statusObj.Reason
			}
			if errorMsg == "" {
				errorMsg = fmt.Sprintf("Failed to obtain the user details (code: %d)", statusObj.Code)
			}
			return "", &UserInfoError{UserMessage: errorMsg}
		}
	}

	if resp.StatusCode != http.StatusOK {
		var userInfoResp v1beta1.UserInfoResponse
		if err := json.Unmarshal(body, &userInfoResp); err == nil {
			if userInfoResp.Error != nil {
				return "", &UserInfoError{UserMessage: *userInfoResp.Error}
			}
			return "", &UserInfoError{UserMessage: fmt.Sprintf("Failed to obtain the user details (status code: %d)", resp.StatusCode)}
		}
		return "", &UserInfoError{UserMessage: fmt.Sprintf("Failed to obtain the user details (status code: %d)", resp.StatusCode)}
	}

	// Status is OK, parse as JSON
	var userInfoResp v1beta1.UserInfoResponse
	if err := json.Unmarshal(body, &userInfoResp); err != nil {
		return "", &UserInfoError{UserMessage: "Failed to obtain the user details (invalid response format).", Err: err}
	}

	// Check for errors in response (even with 200 status)
	if userInfoResp.Error != nil {
		return "", &UserInfoError{UserMessage: *userInfoResp.Error}
	}

	if userInfoResp.PreferredUsername == nil {
		return "", &UserInfoError{UserMessage: "Failed to obtain the user details (missing username)."}
	}

	// Extract and strip the k8s service account prefix from preferred_username if present
	username := *userInfoResp.PreferredUsername
	if strings.HasPrefix(username, k8sServiceAccountPrefix) {
		username = strings.TrimPrefix(username, k8sServiceAccountPrefix)
	}

	return username, nil
}

// convertTokenResponseToTokenData converts TokenResponse to proxy TokenData
// Based on provider type, it only stores the appropriate token to reduce cookie size:
//   - OIDC/K8s: stores IDToken (JWT)
//   - OAuth2/AAP/OpenShift: stores AccessToken (opaque)
func convertTokenResponseToTokenData(tokenResp *v1beta1.TokenResponse, providerConfig *v1beta1.AuthProvider) (TokenData, *int64) {
	tokenData := TokenData{
		Provider: "",
	}

	if providerConfig != nil && providerConfig.Metadata.Name != nil {
		tokenData.Provider = *providerConfig.Metadata.Name
	}

	// Determine provider type to decide which token to store
	if providerConfig != nil {
		providerTypeStr, err := providerConfig.Spec.Discriminator()
		if err == nil {
			switch providerTypeStr {
			case ProviderTypeOIDC, ProviderTypeK8s:
				// OIDC and K8s use IDToken (JWT)
				if tokenResp.IdToken != nil {
					tokenData.Token = *tokenResp.IdToken
				}
			case ProviderTypeOAuth2, ProviderTypeAAP, ProviderTypeOpenShift:
				// OAuth2, AAP, and OpenShift use AccessToken (opaque)
				if tokenResp.AccessToken != nil {
					tokenData.Token = *tokenResp.AccessToken
				}
			}
		}
	}

	// Fallback: if token not set yet (unknown provider type, error determining type, or no provider config),
	// prefer IDToken if available, otherwise AccessToken
	if tokenData.Token == "" {
		if tokenResp.IdToken != nil {
			tokenData.Token = *tokenResp.IdToken
		} else if tokenResp.AccessToken != nil {
			tokenData.Token = *tokenResp.AccessToken
		}
	}

	if tokenResp.RefreshToken != nil {
		tokenData.RefreshToken = *tokenResp.RefreshToken
	}

	var expiresIn *int64
	if tokenResp.ExpiresIn != nil {
		// Convert from *int to *int64
		expiresInVal := int64(*tokenResp.ExpiresIn)
		expiresIn = &expiresInVal
	}

	return tokenData, expiresIn
}
