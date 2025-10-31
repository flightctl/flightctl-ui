package auth

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/flightctl/flightctl-ui/bridge"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
	"github.com/flightctl/flightctl/api/v1alpha1"
	"github.com/openshift/osincli"
)

type OIDCAuthHandler struct {
	tlsConfig          *tls.Config
	client             *osincli.Client
	internalClient     *osincli.Client
	endSessionEndpoint string
	userInfoEndpoint   string
	authURL            string
	tokenEndpoint      string
	clientId           string
	providerName       string
	usernameClaim      []string // JSON path to username claim as array of path segments (e.g., ["preferred_username"], ["user", "name"])
}

type oidcServerResponse struct {
	TokenEndpoint      string `json:"token_endpoint"`
	AuthEndpoint       string `json:"authorization_endpoint"`
	UserInfoEndpoint   string `json:"userinfo_endpoint"`
	EndSessionEndpoint string `json:"end_session_endpoint"`
}

func getOIDCAuthHandler(provider *v1alpha1.AuthProvider, oidcSpec *v1alpha1.OIDCProviderSpec) (*OIDCAuthHandler, error) {
	providerName := ""
	if provider.Metadata.Name != nil {
		providerName = *provider.Metadata.Name
	}

	if oidcSpec.Issuer == "" {
		return nil, fmt.Errorf("OIDC provider %s missing Issuer", providerName)
	}

	if oidcSpec.ClientId == "" {
		return nil, fmt.Errorf("OIDC provider %s missing ClientId", providerName)
	}

	authURL := oidcSpec.Issuer
	clientId := oidcSpec.ClientId
	internalAuthURL := (*string)(nil) // OIDC doesn't use internalAuthURL for now

	tlsConfig, err := bridge.GetAuthTlsConfig()
	if err != nil {
		return nil, err
	}

	url := authURL
	if internalAuthURL != nil {
		url = *internalAuthURL
	}

	oauthConfigUrl := fmt.Sprintf("%s/.well-known/openid-configuration", url)
	req, err := http.NewRequest(http.MethodGet, oauthConfigUrl, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create http request: %w", err)
	}

	httpClient := http.Client{
		Transport: &http.Transport{
			TLSClientConfig: tlsConfig,
		},
	}

	res, err := httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch oidc config: %w", err)
	}

	defer res.Body.Close()
	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read oidc config: %w", err)
	}

	oidcResponse := oidcServerResponse{}
	if err := json.Unmarshal(bodyBytes, &oidcResponse); err != nil {
		return nil, fmt.Errorf("failed to parse oidc config: %w", err)
	}

	internalClient, err := getOIDCClient(oidcResponse, tlsConfig, clientId, oidcSpec.Scopes)
	if err != nil {
		return nil, err
	}

	// Get username claim from provider config, default to DefaultUsernameClaim
	usernameClaim := []string{DefaultUsernameClaim}
	if oidcSpec.UsernameClaim != nil && len(*oidcSpec.UsernameClaim) > 0 {
		usernameClaim = *oidcSpec.UsernameClaim
	}

	handler := &OIDCAuthHandler{
		tlsConfig:          tlsConfig,
		internalClient:     internalClient,
		client:             internalClient,
		endSessionEndpoint: oidcResponse.EndSessionEndpoint,
		userInfoEndpoint:   oidcResponse.UserInfoEndpoint,
		authURL:            authURL,
		tokenEndpoint:      oidcResponse.TokenEndpoint,
		clientId:           clientId,
		providerName:       providerName,
		usernameClaim:      usernameClaim,
	}

	if internalAuthURL != nil {
		extConfig := oidcServerResponse{
			AuthEndpoint:       replaceBaseURL(oidcResponse.AuthEndpoint, *internalAuthURL, authURL),
			TokenEndpoint:      replaceBaseURL(oidcResponse.TokenEndpoint, *internalAuthURL, authURL),
			UserInfoEndpoint:   replaceBaseURL(oidcResponse.UserInfoEndpoint, *internalAuthURL, authURL),
			EndSessionEndpoint: replaceBaseURL(oidcResponse.EndSessionEndpoint, *internalAuthURL, authURL),
		}
		client, err := getOIDCClient(extConfig, tlsConfig, clientId, oidcSpec.Scopes)
		if err != nil {
			return nil, err
		}
		handler.client = client
		handler.endSessionEndpoint = extConfig.EndSessionEndpoint
		handler.tokenEndpoint = extConfig.TokenEndpoint
	}

	return handler, nil
}

func replaceBaseURL(endpoint, oldBase, newBase string) string {
	oldURL, err := url.Parse(oldBase)
	if err != nil {
		return endpoint
	}
	newURL, err := url.Parse(newBase)
	if err != nil {
		return endpoint
	}
	endpointURL, err := url.Parse(endpoint)
	if err != nil {
		return endpoint
	}
	if endpointURL.Host == oldURL.Host {
		endpointURL.Scheme = newURL.Scheme
		endpointURL.Host = newURL.Host
	}
	return endpointURL.String()
}

func getOIDCClient(oidcConfig oidcServerResponse, tlsConfig *tls.Config, clientId string, providerScopes *[]string) (*osincli.Client, error) {
	defaultScopes := "openid profile email"
	if config.IsOrganizationsEnabled() {
		defaultScopes += " organization:*"
	}
	scope := buildScopeParam(providerScopes, defaultScopes)

	oidcClientConfig := &osincli.ClientConfig{
		ClientId:                 clientId,
		AuthorizeUrl:             oidcConfig.AuthEndpoint,
		TokenUrl:                 oidcConfig.TokenEndpoint,
		RedirectUrl:              config.BaseUiUrl + "/callback",
		ErrorsInStatusCode:       true,
		SendClientSecretInParams: false,
		Scope:                    scope,
	}

	client, err := osincli.NewClient(oidcClientConfig)
	if err != nil {
		return nil, err
	}

	client.Transport = &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	return client, nil
}

func (a *OIDCAuthHandler) GetToken(loginParams LoginParameters) (TokenData, *int64, error) {
	return exchangeToken(loginParams, a.internalClient, a.tokenEndpoint, a.clientId, config.BaseUiUrl+"/callback")
}

func (o *OIDCAuthHandler) GetUserInfo(tokenData TokenData) (string, *http.Response, error) {
	// For OIDC, use AccessToken for userinfo endpoint
	token := tokenData.AccessToken
	if token == "" {
		return "", nil, fmt.Errorf("access token is required for OIDC userinfo")
	}

	body, resp, err := getUserInfo(token, o.tlsConfig, o.authURL, o.userInfoEndpoint)

	if err != nil {
		log.GetLogger().WithError(err).Warnf("Failed to get user info from provider %s", o.providerName)
		return "", resp, err
	}

	if resp.StatusCode != http.StatusOK {
		log.GetLogger().Warnf("Userinfo endpoint returned status %d for provider %s", resp.StatusCode, o.providerName)
		return "", resp, fmt.Errorf("userinfo endpoint returned status %d", resp.StatusCode)
	}

	if body == nil {
		log.GetLogger().Warnf("Userinfo endpoint returned empty body for provider %s", o.providerName)
		return "", resp, fmt.Errorf("userinfo endpoint returned empty body")
	}

	// Parse as generic map to support different userinfo response formats
	var userInfo map[string]interface{}
	if err := json.Unmarshal(*body, &userInfo); err != nil {
		log.GetLogger().WithError(err).Warnf("Failed to unmarshal OIDC user response for provider %s. Body: %s", o.providerName, string(*body))
		return "", resp, fmt.Errorf("failed to unmarshal OIDC user response: %w", err)
	}

	// Extract username from the specified claim path
	username := extractUsernameFromUserInfo(userInfo, o.usernameClaim)
	if username == "" {
		log.GetLogger().Warnf("Could not extract username from claim path %v in userinfo response for provider %s. Available fields: %v", o.usernameClaim, o.providerName, getMapKeys(userInfo))
		return "", resp, fmt.Errorf("username not found in userinfo response using claim path: %v", o.usernameClaim)
	}

	return username, resp, nil
}

func (o *OIDCAuthHandler) Logout(token string) (string, error) {
	u, err := url.Parse(o.endSessionEndpoint)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to parse OIDC response")
		return "", err
	}

	uq := u.Query()
	uq.Add("post_logout_redirect_uri", config.BaseUiUrl)
	uq.Add("client_id", o.clientId)
	u.RawQuery = uq.Encode()
	return u.String(), nil
}

func (o *OIDCAuthHandler) RefreshToken(refreshToken string) (TokenData, *int64, error) {
	return refreshOAuthToken(refreshToken, o.internalClient)
}

func (a *OIDCAuthHandler) GetLoginRedirectURL(codeChallenge string, codeVerifier string) string {
	return loginRedirect(a.client, a.providerName, codeChallenge, codeVerifier)
}
