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

type OpenShiftAuthHandler struct {
	tlsConfig      *tls.Config
	client         *osincli.Client
	internalClient *osincli.Client
	authURL        string
	tokenURL       string
	apiServerURL   string
	clientId       string
	providerName   string
}

type openshiftOAuthDiscovery struct {
	Issuer                string `json:"issuer"`
	AuthorizationEndpoint string `json:"authorization_endpoint"`
	TokenEndpoint         string `json:"token_endpoint"`
}

func getOpenShiftAuthHandler(provider *v1alpha1.AuthProvider, k8sSpec *v1alpha1.K8sProviderSpec) (*OpenShiftAuthHandler, error) {
	providerName := ""
	if provider.Metadata.Name != nil {
		providerName = *provider.Metadata.Name
	}

	// For OpenShift OAuth, we need externalOpenShiftApiUrl
	authURL := ""
	if k8sSpec.ExternalOpenShiftApiUrl != nil && *k8sSpec.ExternalOpenShiftApiUrl != "" {
		authURL = *k8sSpec.ExternalOpenShiftApiUrl
	} else if k8sSpec.ApiUrl != "" {
		authURL = k8sSpec.ApiUrl
	} else {
		return nil, fmt.Errorf("OpenShift provider %s missing ApiUrl or ExternalOpenShiftApiUrl", providerName)
	}

	apiServerURL := authURL // OpenShift API server URL (used for discovery)

	// OpenShift OAuth typically uses "system:serviceaccount:openshift-authentication:oauth-proxy" as client ID
	// or a configured client ID. Since K8sProviderSpec doesn't have ClientId, we'll use a default
	clientId := "system:serviceaccount:openshift-authentication:oauth-proxy"

	// OpenShift OAuth token endpoint is typically at {apiServerURL}/oauth/token
	tokenURL := fmt.Sprintf("%s/oauth/token", apiServerURL)

	tlsConfig, err := bridge.GetAuthTlsConfig()
	if err != nil {
		return nil, err
	}

	// OpenShift OAuth uses "user:full" scope by default
	scope := "user:full"
	// Note: K8sProviderSpec doesn't have Scopes field, so we use default

	// Create OAuth2 client config for OpenShift
	oauthClientConfig := &osincli.ClientConfig{
		ClientId:                 clientId,
		AuthorizeUrl:             fmt.Sprintf("%s/oauth/authorize", apiServerURL),
		TokenUrl:                 tokenURL,
		RedirectUrl:              config.BaseUiUrl + "/callback",
		ErrorsInStatusCode:       true,
		SendClientSecretInParams: false,
		Scope:                    scope,
	}

	client, err := osincli.NewClient(oauthClientConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create OpenShift OAuth client: %w", err)
	}

	client.Transport = &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	handler := &OpenShiftAuthHandler{
		tlsConfig:      tlsConfig,
		internalClient: client,
		client:         client,
		authURL:        fmt.Sprintf("%s/oauth/authorize", apiServerURL),
		tokenURL:       tokenURL,
		apiServerURL:   apiServerURL,
		clientId:       clientId,
		providerName:   providerName,
	}

	return handler, nil
}

func (o *OpenShiftAuthHandler) GetToken(loginParams LoginParameters) (TokenData, *int64, error) {
	// OpenShift typically doesn't require client_secret with PKCE
	return exchangeToken(loginParams, o.internalClient, o.tokenURL, o.clientId, config.BaseUiUrl+"/callback")
}

func (o *OpenShiftAuthHandler) GetUserInfo(tokenData TokenData) (string, *http.Response, error) {
	resp := &http.Response{
		StatusCode: http.StatusInternalServerError,
	}
	return "", resp, fmt.Errorf("User information should be retrieved through the flightctl API")
}

func (o *OpenShiftAuthHandler) RefreshToken(refreshToken string) (TokenData, *int64, error) {
	return refreshOAuthToken(refreshToken, o.internalClient)
}

func (o *OpenShiftAuthHandler) Logout(token string) (string, error) {
	// OpenShift OAuth logout endpoint is typically at {issuer}/logout
	// Try to discover it from the OAuth discovery endpoint
	discoveryURL := fmt.Sprintf("%s/.well-known/oauth-authorization-server", o.apiServerURL)
	req, err := http.NewRequest(http.MethodGet, discoveryURL, nil)
	if err != nil {
		log.GetLogger().WithError(err).Debug("Failed to create discovery request for logout URL")
		return "", nil
	}

	httpClient := http.Client{
		Transport: &http.Transport{
			TLSClientConfig: o.tlsConfig,
		},
	}

	res, err := httpClient.Do(req)
	if err != nil {
		log.GetLogger().WithError(err).Debug("Failed to fetch OAuth discovery for logout URL")
		return "", nil
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		log.GetLogger().Debugf("OAuth discovery returned status %d", res.StatusCode)
		return "", nil
	}

	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		log.GetLogger().WithError(err).Debug("Failed to read OAuth discovery response")
		return "", nil
	}

	var discovery openshiftOAuthDiscovery
	if err := json.Unmarshal(bodyBytes, &discovery); err != nil {
		log.GetLogger().WithError(err).Debug("Failed to parse OAuth discovery response")
		return "", nil
	}

	if discovery.Issuer != "" {
		logoutURL, err := url.Parse(discovery.Issuer)
		if err == nil {
			logoutURL.Path = "/logout"
			return logoutURL.String(), nil
		}
	}

	return "", nil
}

func (o *OpenShiftAuthHandler) GetLoginRedirectURL(codeChallenge string, codeVerifier string) string {
	return loginRedirect(o.client, o.providerName, codeChallenge, codeVerifier)
}
