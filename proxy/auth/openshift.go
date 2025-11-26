package auth

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/flightctl/flightctl-ui/bridge"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
	"github.com/flightctl/flightctl/api/v1beta1"
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

// getOpenShiftAuthHandlerFromSpec creates an OpenShift auth handler from OpenShiftProviderSpec
func getOpenShiftAuthHandlerFromSpec(provider *v1beta1.AuthProvider, openshiftSpec *v1beta1.OpenShiftProviderSpec) (*OpenShiftAuthHandler, error) {
	providerName := extractProviderName(provider)

	// Determine the API server URL - prefer ClusterControlPlaneUrl, fallback to authorization URL base
	apiServerURL := ""
	if openshiftSpec.ClusterControlPlaneUrl != nil && *openshiftSpec.ClusterControlPlaneUrl != "" {
		apiServerURL = *openshiftSpec.ClusterControlPlaneUrl
	} else if openshiftSpec.AuthorizationUrl != nil && *openshiftSpec.AuthorizationUrl != "" {
		// Extract base URL from authorization URL (remove /oauth/authorize if present)
		authURL := *openshiftSpec.AuthorizationUrl
		parsedURL, err := url.Parse(authURL)
		if err == nil {
			// Remove /oauth/authorize path if present
			if parsedURL.Path == "/oauth/authorize" || strings.HasSuffix(parsedURL.Path, "/oauth/authorize") {
				parsedURL.Path = strings.TrimSuffix(parsedURL.Path, "/oauth/authorize")
			}
			apiServerURL = parsedURL.String()
		} else {
			apiServerURL = authURL
		}
	} else {
		return nil, fmt.Errorf("OpenShift provider %s missing ClusterControlPlaneUrl or AuthorizationUrl", providerName)
	}

	// Determine authorization URL
	authURL := ""
	if openshiftSpec.AuthorizationUrl != nil && *openshiftSpec.AuthorizationUrl != "" {
		authURL = *openshiftSpec.AuthorizationUrl
	} else {
		// Default to {apiServerURL}/oauth/authorize
		authURL = fmt.Sprintf("%s/oauth/authorize", apiServerURL)
	}

	// Determine token URL
	tokenURL := ""
	if openshiftSpec.TokenUrl != nil && *openshiftSpec.TokenUrl != "" {
		tokenURL = *openshiftSpec.TokenUrl
	} else {
		// Default to {apiServerURL}/oauth/token
		tokenURL = fmt.Sprintf("%s/oauth/token", apiServerURL)
	}

	// Determine client ID - required, no default
	if openshiftSpec.ClientId == nil || *openshiftSpec.ClientId == "" {
		return nil, fmt.Errorf("OpenShift provider %s missing required ClientId", providerName)
	}
	clientId := *openshiftSpec.ClientId

	tlsConfig, err := bridge.GetAuthTlsConfig()
	if err != nil {
		return nil, err
	}

	// Determine scopes
	scope := "user:full" // Default scope
	if openshiftSpec.Scopes != nil && len(*openshiftSpec.Scopes) > 0 {
		scope = buildScopeParam(openshiftSpec.Scopes, scope)
	}

	// Create OAuth2 client config for OpenShift
	oauthClientConfig := &osincli.ClientConfig{
		ClientId:                 clientId,
		AuthorizeUrl:             authURL,
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
		authURL:        authURL,
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

func (o *OpenShiftAuthHandler) GetLoginRedirectURL(codeChallenge string) string {
	return loginRedirect(o.client, o.providerName, codeChallenge)
}
