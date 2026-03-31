package auth

import (
	"crypto/tls"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/flightctl/flightctl-ui/bridge"
	"github.com/flightctl/flightctl/api/v1beta1"
	"github.com/openshift/osincli"
)

type OpenShiftAuthHandler struct {
	tlsConfig    *tls.Config
	authURL      string
	tokenURL     string
	apiServerURL string
	clientId     string
	scope        string
	providerName string
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

	handler := &OpenShiftAuthHandler{
		tlsConfig:    tlsConfig,
		authURL:      authURL,
		tokenURL:     tokenURL,
		apiServerURL: apiServerURL,
		clientId:     clientId,
		scope:        scope,
		providerName: providerName,
	}

	return handler, nil
}

func (o *OpenShiftAuthHandler) openshiftClientForRedirect(redirectURI string) (*osincli.Client, error) {
	oauthClientConfig := &osincli.ClientConfig{
		ClientId:                 o.clientId,
		AuthorizeUrl:             o.authURL,
		TokenUrl:                 o.tokenURL,
		RedirectUrl:              redirectURI,
		ErrorsInStatusCode:       true,
		SendClientSecretInParams: false,
		Scope:                    o.scope,
	}

	client, err := osincli.NewClient(oauthClientConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create OpenShift OAuth client: %w", err)
	}

	client.Transport = &http.Transport{
		TLSClientConfig: o.tlsConfig,
	}
	return client, nil
}

func (o *OpenShiftAuthHandler) Logout(token string, _ string) (string, error) {
	// The cookie will be cleared by the proxy
	return "", nil
}

func (o *OpenShiftAuthHandler) GetLoginRedirectURL(state string, codeChallenge string, redirectURI string) (string, error) {
	client, err := o.openshiftClientForRedirect(redirectURI)
	if err != nil {
		return "", err
	}
	return loginRedirect(client, state, codeChallenge), nil
}
