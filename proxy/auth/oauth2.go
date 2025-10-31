package auth

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/flightctl/flightctl-ui/bridge"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
	"github.com/flightctl/flightctl/api/v1alpha1"
	"github.com/openshift/osincli"
)

type OAuth2AuthHandler struct {
	tlsConfig        *tls.Config
	client           *osincli.Client
	internalClient   *osincli.Client
	userInfoEndpoint string
	authURL          string
	tokenURL         string
	clientId         string
	providerName     string
	usernameClaim    []string // JSON path to username claim as array of path segments (e.g., ["preferred_username"], ["user", "name"])
}

// getOAuth2AuthHandler creates an OAuth2 handler using explicit endpoints
func getOAuth2AuthHandler(provider *v1alpha1.AuthProvider, oauth2Spec *v1alpha1.OAuth2ProviderSpec) (*OAuth2AuthHandler, error) {
	providerName := ""
	if provider.Metadata.Name != nil {
		providerName = *provider.Metadata.Name
	}

	if oauth2Spec.AuthorizationUrl == "" || oauth2Spec.TokenUrl == "" || oauth2Spec.UserinfoUrl == "" || oauth2Spec.ClientId == "" || oauth2Spec.Scopes == nil || len(*oauth2Spec.Scopes) == 0 {
		return nil, fmt.Errorf("OAuth2 provider %s missing required fields", providerName)
	}

	authURL := oauth2Spec.AuthorizationUrl
	tokenURL := oauth2Spec.TokenUrl
	userinfoURL := oauth2Spec.UserinfoUrl
	clientId := oauth2Spec.ClientId

	// Get username claim from provider config, default to DefaultUsernameClaim
	usernameClaim := []string{DefaultUsernameClaim}
	if oauth2Spec.UsernameClaim != nil && len(*oauth2Spec.UsernameClaim) > 0 {
		usernameClaim = *oauth2Spec.UsernameClaim
	}

	tlsConfig, err := bridge.GetAuthTlsConfig()
	if err != nil {
		return nil, err
	}

	// Build scope string (no default scopes for OAuth2 - scopes are mandatory)
	scope := buildScopeParam(oauth2Spec.Scopes, "")

	// Create OAuth2 client config
	oauth2ClientConfig := &osincli.ClientConfig{
		ClientId:                 clientId,
		ClientSecret:             "", // Not needed with PKCE for public clients
		AuthorizeUrl:             authURL,
		TokenUrl:                 tokenURL,
		RedirectUrl:              config.BaseUiUrl + "/callback",
		ErrorsInStatusCode:       true,
		SendClientSecretInParams: false, // PKCE is used instead of client secret
		Scope:                    scope,
	}

	client, err := osincli.NewClient(oauth2ClientConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create OAuth2 client: %w", err)
	}

	client.Transport = &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	handler := &OAuth2AuthHandler{
		tlsConfig:        tlsConfig,
		internalClient:   client,
		client:           client,
		userInfoEndpoint: userinfoURL,
		authURL:          authURL,
		tokenURL:         tokenURL,
		clientId:         clientId,
		providerName:     providerName,
		usernameClaim:    usernameClaim,
	}

	return handler, nil
}

func (o *OAuth2AuthHandler) GetToken(loginParams LoginParameters) (TokenData, *int64, error) {
	return exchangeToken(loginParams, o.internalClient, o.tokenURL, o.clientId, config.BaseUiUrl+"/callback")
}

func (o *OAuth2AuthHandler) GetUserInfo(tokenData TokenData) (string, *http.Response, error) {
	// For OAuth2, use AccessToken for userinfo endpoint
	token := tokenData.AccessToken
	if token == "" {
		return "", nil, fmt.Errorf("access token is required for OAuth2 userinfo")
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
		log.GetLogger().WithError(err).Warnf("Failed to unmarshal OAuth2 user response for provider %s. Body: %s", o.providerName, string(*body))
		return "", resp, fmt.Errorf("failed to unmarshal OAuth2 user response: %w", err)
	}

	log.GetLogger().Debugf("Userinfo response for provider %s: %+v", o.providerName, userInfo)

	// Extract username from the specified claim path
	username := extractUsernameFromUserInfo(userInfo, o.usernameClaim)
	if username == "" {
		log.GetLogger().Warnf("Could not extract username from claim path %v in userinfo response for provider %s. Available fields: %v", o.usernameClaim, o.providerName, getMapKeys(userInfo))
		return "", resp, fmt.Errorf("username not found in userinfo response using claim path: %v", o.usernameClaim)
	}

	log.GetLogger().Debugf("Extracted username '%s' from provider %s using claim path %v", username, o.providerName, o.usernameClaim)
	return username, resp, nil
}

func (o *OAuth2AuthHandler) Logout(token string) (string, error) {
	// OAuth2 providers typically don't have a standardized logout endpoint
	// Return empty string to indicate no logout URL
	return "", nil
}

func (o *OAuth2AuthHandler) RefreshToken(refreshToken string) (TokenData, *int64, error) {
	return refreshOAuthToken(refreshToken, o.internalClient)
}

func (o *OAuth2AuthHandler) GetLoginRedirectURL(codeChallenge string, codeVerifier string) string {
	return loginRedirect(o.client, o.providerName, codeChallenge, codeVerifier)
}
