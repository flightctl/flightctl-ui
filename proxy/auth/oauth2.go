package auth

import (
	"crypto/tls"
	"fmt"
	"net/http"

	"github.com/flightctl/flightctl-ui/bridge"
	"github.com/flightctl/flightctl-ui/config"
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
}

// getOAuth2AuthHandler creates an OAuth2 handler using explicit endpoints
func getOAuth2AuthHandler(provider *v1alpha1.AuthProvider, oauth2Spec *v1alpha1.OAuth2ProviderSpec) (*OAuth2AuthHandler, error) {
	providerName := extractProviderName(provider)

	if oauth2Spec.AuthorizationUrl == "" || oauth2Spec.TokenUrl == "" || oauth2Spec.UserinfoUrl == "" || oauth2Spec.ClientId == "" || oauth2Spec.Scopes == nil || len(*oauth2Spec.Scopes) == 0 {
		return nil, fmt.Errorf("OAuth2 provider %s missing required fields", providerName)
	}

	authURL := oauth2Spec.AuthorizationUrl
	tokenURL := oauth2Spec.TokenUrl
	userinfoURL := oauth2Spec.UserinfoUrl
	clientId := oauth2Spec.ClientId

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
	}

	return handler, nil
}

func (o *OAuth2AuthHandler) GetToken(loginParams LoginParameters) (TokenData, *int64, error) {
	return exchangeToken(loginParams, o.internalClient, o.tokenURL, o.clientId, config.BaseUiUrl+"/callback")
}

func (o *OAuth2AuthHandler) GetUserInfo(tokenData TokenData) (string, *http.Response, error) {
	resp := &http.Response{
		StatusCode: http.StatusInternalServerError,
	}
	return "", resp, fmt.Errorf("User information should be retrieved through the flightctl API")
}

func (o *OAuth2AuthHandler) Logout(token string) (string, error) {
	// OAuth2 providers typically don't have a standardized logout endpoint
	// Return empty string to indicate no logout URL
	return "", nil
}

func (o *OAuth2AuthHandler) RefreshToken(refreshToken string) (TokenData, *int64, error) {
	return refreshOAuthToken(refreshToken, o.internalClient)
}

func (o *OAuth2AuthHandler) GetLoginRedirectURL(codeChallenge string) string {
	return loginRedirect(o.client, o.providerName, codeChallenge)
}
