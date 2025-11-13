package auth

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
	"github.com/flightctl/flightctl/api/v1alpha1"
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

type AuthHandler struct {
	provider AuthProvider
}

func NewAuth(apiTlsConfig *tls.Config) (*AuthHandler, error) {
	auth := AuthHandler{}
	authConfig, internalAuthUrl, err := getAuthInfo(apiTlsConfig)
	if err != nil {
		return nil, err
	}

	if authConfig == nil {
		log.GetLogger().Info("Auth disabled")
		return &auth, nil
	}

	providerType, authURL, err := extractProviderInfo(authConfig)
	if err != nil {
		return nil, err
	}

	switch providerType {
	case "AAPGateway":
		auth.provider, err = getAAPAuthHandler(authURL, internalAuthUrl)
	case "OIDC":
		auth.provider, err = getOIDCAuthHandler(authURL, internalAuthUrl)
	case "k8s":
		auth.provider, err = getK8sAuthHandler(authURL, internalAuthUrl)
	default:
		err = fmt.Errorf("unknown auth type: %s", providerType)
	}
	return &auth, err
}

func (a AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if a.provider == nil {
		w.WriteHeader(http.StatusTeapot)
		return
	}
	if r.Method == http.MethodPost {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			log.GetLogger().WithError(err).Warn("Failed to read request body")
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		// Check if this is a token-based auth provider (k8s)
		if tokenProvider, ok := a.provider.(*TokenAuthProvider); ok {
			var loginParams TokenLoginParameters
			err = json.Unmarshal(body, &loginParams)
			if err != nil {
				log.GetLogger().WithError(err).Warn("Failed to unmarshal request body")
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			if loginParams.Token == "" {
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			tokenData, expires, err := tokenProvider.ValidateToken(loginParams.Token)
			if err != nil {
				log.GetLogger().WithError(err).Warn("Token validation failed")
				respondWithError(w, http.StatusUnauthorized, err.Error())
				return
			}
			respondWithToken(w, tokenData, expires)
			return
		}

		// OAuth-based providers (OIDC, AAP)
		loginParams := LoginParameters{}
		err = json.Unmarshal(body, &loginParams)
		if err != nil {
			log.GetLogger().WithError(err).Warn("Failed to unmarshal request body")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		tokenData, expires, err := a.provider.GetToken(loginParams)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		respondWithToken(w, tokenData, expires)
	} else {
		loginUrl := a.provider.GetLoginRedirectURL()
		response, err := json.Marshal(RedirectResponse{Url: loginUrl})
		if err != nil {
			log.GetLogger().WithError(err).Warn("Failed to marshal response")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		if _, err := w.Write(response); err != nil {
			log.GetLogger().WithError(err).Warn("Failed to write response")
		}
	}
}

func (a AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	if a.provider == nil {
		w.WriteHeader(http.StatusTeapot)
		return
	}
	tokenData, err := ParseSessionCookie(r)
	if err != nil {
		clearCookie(w)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	tokenData, expires, err := a.provider.RefreshToken(tokenData.RefreshToken)
	if err != nil {
		clearCookie(w)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	respondWithToken(w, tokenData, expires)
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
	if _, err := w.Write(exp); err != nil {
		log.GetLogger().WithError(err).Warn("Failed to write response")
	}
}

func (a AuthHandler) GetUserInfo(w http.ResponseWriter, r *http.Request) {
	if a.provider == nil {
		w.WriteHeader(http.StatusTeapot)
		return
	}

	token, err := getToken(r)
	if token == "" || err != nil {
		clearCookie(w)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	username, resp, err := a.provider.GetUserInfo(token)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to get user info")
		if resp != nil && resp.StatusCode == http.StatusUnauthorized {
			clearCookie(w)
			w.WriteHeader(http.StatusUnauthorized)
		} else {
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}
	if resp.StatusCode != http.StatusOK {
		if resp.StatusCode == http.StatusUnauthorized {
			clearCookie(w)
		}
		w.WriteHeader(resp.StatusCode)
		return
	}
	userInfo := UserInfoResponse{Username: username}
	res, err := json.Marshal(userInfo)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to marshal user info")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if _, err := w.Write(res); err != nil {
		log.GetLogger().WithError(err).Warn("Failed to write response")
	}
}

func (a AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	if a.provider == nil {
		w.WriteHeader(http.StatusTeapot)
		return
	}

	token, err := getToken(r)
	if token == "" || err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	redirectUrl, err := a.provider.Logout(token)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to logout")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Clear-Site-Data", `"cookies"`)
	redirectResp := RedirectResponse{}
	if redirectUrl != "" {
		redirectResp.Url = redirectUrl
	}
	response, err := json.Marshal(redirectResp)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to marshal response")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if _, err := w.Write(response); err != nil {
		log.GetLogger().WithError(err).Warn("Failed to write response")
	}
}

func getAuthInfo(apiTlsConfig *tls.Config) (*v1alpha1.AuthConfig, *string, error) {
	client := &http.Client{Transport: &http.Transport{
		TLSClientConfig: apiTlsConfig,
	}}
	authConfigUrl := config.FctlApiUrl + "/api/v1/auth/config"

	req, err := http.NewRequest(http.MethodGet, authConfigUrl, nil)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Could not create request")
		return nil, nil, err
	}

	resp, err := client.Do(req)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to get auth config")
		return nil, nil, err
	}

	if resp.StatusCode == http.StatusTeapot {
		return nil, nil, nil
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to read terminal session response")
		return nil, nil, err
	}

	authConfig := &v1alpha1.AuthConfig{}
	err = json.Unmarshal(body, authConfig)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to unmarshal auth config")
		return nil, nil, err
	}

	if config.InternalAuthUrl == "" {
		return authConfig, nil, nil
	}
	return authConfig, &config.InternalAuthUrl, nil
}

// extractProviderInfo extracts the provider type and URL from the default provider in AuthConfig.
// It currently only handles the provider marked as the default one.
func extractProviderInfo(authConfig *v1alpha1.AuthConfig) (string, string, error) {
	if authConfig.DefaultProvider == nil || *authConfig.DefaultProvider == "" {
		return "", "", fmt.Errorf("no default provider specified")
	}

	if authConfig.Providers == nil || len(*authConfig.Providers) == 0 {
		return "", "", fmt.Errorf("no auth providers configured")
	}

	// Find the default provider by name
	var defaultProvider *v1alpha1.AuthProvider
	for i := range *authConfig.Providers {
		provider := &(*authConfig.Providers)[i]
		if provider.Metadata.Name != nil && *provider.Metadata.Name == *authConfig.DefaultProvider {
			defaultProvider = provider
			break
		}
	}

	if defaultProvider == nil {
		return "", "", fmt.Errorf("default provider '%s' not found in providers list", *authConfig.DefaultProvider)
	}

	// Extract provider type and URL based on the provider spec
	// We only need the discriminator and URL fields, so we parse the union JSON directly
	discriminator, err := defaultProvider.Spec.Discriminator()
	if err != nil {
		return "", "", fmt.Errorf("failed to determine provider type: %w", err)
	}

	var providerType string
	var authURL string

	// Parse only the fields we need from the spec union
	// Marshal the spec to get the raw JSON, then unmarshal into a map
	specJSON, err := json.Marshal(defaultProvider.Spec)
	if err != nil {
		return "", "", fmt.Errorf("failed to marshal provider spec: %w", err)
	}
	var specMap map[string]interface{}
	if err := json.Unmarshal(specJSON, &specMap); err != nil {
		return "", "", fmt.Errorf("failed to parse provider spec: %w", err)
	}

	switch discriminator {
	case "oidc":
		providerType = "OIDC"
		if issuer, ok := specMap["issuer"].(string); ok {
			authURL = issuer
		} else {
			return "", "", fmt.Errorf("issuer not found in OIDC provider spec")
		}
	case "aap":
		providerType = "AAPGateway"
		// Prefer external URL if available, otherwise use internal API URL
		if extURL, ok := specMap["externalApiUrl"].(string); ok && extURL != "" {
			authURL = extURL
		} else if apiURL, ok := specMap["apiUrl"].(string); ok {
			authURL = apiURL
		} else {
			return "", "", fmt.Errorf("apiUrl not found in AAP provider spec")
		}
	case "k8s":
		providerType = "k8s"
		if apiURL, ok := specMap["apiUrl"].(string); ok {
			authURL = apiURL
		} else {
			return "", "", fmt.Errorf("apiUrl not found in K8s provider spec")
		}
	default:
		return "", "", fmt.Errorf("unsupported provider type: %s", discriminator)
	}

	if authURL == "" {
		return "", "", fmt.Errorf("auth URL not found for provider type: %s", discriminator)
	}

	return providerType, authURL, nil
}
