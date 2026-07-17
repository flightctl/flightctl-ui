package auth

import (
	"crypto/sha256"
	"crypto/tls"
	b64 "encoding/base64"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/flightctl/flightctl-ui/bridge"
	"github.com/flightctl/flightctl-ui/log"
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
			// url.Parse should not fail on a URL already validated by the API
			// server; fall back to the raw string to preserve backward
			// compatibility rather than failing provider initialization.
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

// openshiftClientForRedirect creates an osincli OAuth2 client configured for
// the given redirect URI using the handler's stored credentials and TLS config.
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

// openShiftTokenName derives the OAuthAccessToken Kubernetes resource name from
// an access token value. Tokens prefixed with "sha256~" are named by hashing
// the full token string with SHA-256 and base64url-encoding the result (no
// padding). Legacy tokens (no prefix) are used as-is — the token value IS the
// resource name in that case.
func openShiftTokenName(token string) string {
	if strings.HasPrefix(token, "sha256~") {
		hash := sha256.Sum256([]byte(token))
		return "sha256~" + b64.RawURLEncoding.EncodeToString(hash[:])
	}
	return token
}

// openShiftAPIServerBase normalises apiServerURL to a plain scheme+host (no
// path, query, or fragment) so the revocation URL is always well-formed even
// when apiServerURL was derived from an AuthorizationUrl that carries extra
// components.
func openShiftAPIServerBase(rawURL string) string {
	parsed, err := url.Parse(rawURL)
	if err != nil || parsed.Host == "" {
		return strings.TrimSuffix(rawURL, "/")
	}
	return parsed.Scheme + "://" + parsed.Host
}

// Logout revokes the OpenShift OAuth access token server-side by issuing a
// DELETE to /apis/oauth.openshift.io/v1/oauthaccesstokens/{name}, authenticated
// with the token itself as the Bearer credential. Revocation invalidates the
// OpenShift session without requiring a browser redirect, avoiding the 405 that
// the OAuth server's /logout endpoint returns for unauthenticated GET requests.
//
// Always returns ("", nil) — the caller falls back to a local page reload which
// lands the user on the login page with no valid session.
func (o *OpenShiftAuthHandler) Logout(token string, _ string) (string, error) {
	if token == "" || o.apiServerURL == "" {
		return "", nil
	}

	tokenName := openShiftTokenName(token)
	base := openShiftAPIServerBase(o.apiServerURL)
	revokeURL := fmt.Sprintf("%s/apis/oauth.openshift.io/v1/oauthaccesstokens/%s", base, tokenName)

	client := &http.Client{
		Transport: &http.Transport{TLSClientConfig: o.tlsConfig},
		Timeout:   10 * time.Second,
	}

	req, err := http.NewRequest(http.MethodDelete, revokeURL, nil)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to build OpenShift token revocation request")
		return "", nil
	}
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := client.Do(req)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to revoke OpenShift OAuth token")
		return "", nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		log.GetLogger().Warnf("OpenShift token revocation returned unexpected status %d", resp.StatusCode)
	}

	return "", nil
}

// GetLoginRedirectURL returns the OAuth2 authorization URL the browser should
// be redirected to in order to initiate the OpenShift login flow.
func (o *OpenShiftAuthHandler) GetLoginRedirectURL(state string, codeChallenge string, redirectURI string) (string, error) {
	client, err := o.openshiftClientForRedirect(redirectURI)
	if err != nil {
		return "", err
	}
	return loginRedirect(client, state, codeChallenge), nil
}
