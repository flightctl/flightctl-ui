package auth

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"net/http"
	"net/url"

	"github.com/flightctl/flightctl-ui/bridge"
	"github.com/flightctl/flightctl-ui/log"
	"github.com/flightctl/flightctl/api/v1beta1"
	"github.com/openshift/osincli"
)

type AAPAuthHandler struct {
	tlsConfig       *tls.Config
	authURL         string
	tokenURL        string
	internalAuthURL string
	clientId        string
	providerName    string
}

type AAPUser struct {
	Username string `json:"username,omitempty"`
}

type AAPUserInfo struct {
	Results []AAPUser `json:"results,omitempty"`
}

type AAPRoundTripper struct {
	Transport http.RoundTripper
}

func (c *AAPRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	resp, err := c.Transport.RoundTrip(req)
	if err != nil {
		return nil, err
	}

	// AAPGateway returns 201 on success, but osincli expects 200
	if resp.StatusCode == http.StatusCreated {
		resp.StatusCode = http.StatusOK
	}
	return resp, nil
}

func getAAPAuthHandler(provider *v1beta1.AuthProvider, aapSpec *v1beta1.AapProviderSpec) (*AAPAuthHandler, error) {
	providerName := extractProviderName(provider)

	// Validate required fields
	if aapSpec.ApiUrl == "" {
		return nil, fmt.Errorf("AAP provider %s missing ApiUrl", providerName)
	}
	if aapSpec.ClientId == "" {
		return nil, fmt.Errorf("AAP provider %s missing ClientId", providerName)
	}
	if aapSpec.AuthorizationUrl == "" {
		return nil, fmt.Errorf("AAP provider %s missing AuthorizationUrl", providerName)
	}
	if aapSpec.TokenUrl == "" {
		return nil, fmt.Errorf("AAP provider %s missing TokenUrl", providerName)
	}

	tlsConfig, err := bridge.GetAuthTlsConfig()
	if err != nil {
		return nil, err
	}

	handler := &AAPAuthHandler{
		tlsConfig:       tlsConfig,
		authURL:         aapSpec.AuthorizationUrl,
		tokenURL:        aapSpec.TokenUrl,
		internalAuthURL: aapSpec.ApiUrl,
		clientId:        aapSpec.ClientId,
		providerName:    providerName,
	}

	return handler, nil
}

func getAAPClient(authorizationUrl, tokenUrl string, tlsConfig *tls.Config, clientId string, redirectURI string) (*osincli.Client, error) {
	// Use provided clientId, require it to be non-empty
	if clientId == "" {
		return nil, fmt.Errorf("clientId is required for AAP provider")
	}

	oidcClientConfig := &osincli.ClientConfig{
		ClientId:                 clientId,
		AuthorizeUrl:             authorizationUrl,
		TokenUrl:                 tokenUrl,
		RedirectUrl:              redirectURI,
		ErrorsInStatusCode:       true,
		SendClientSecretInParams: true,
		Scope:                    "read",
	}

	client, err := osincli.NewClient(oidcClientConfig)
	if err != nil {
		return nil, err
	}

	client.Transport = &AAPRoundTripper{
		Transport: &http.Transport{
			TLSClientConfig: tlsConfig,
		},
	}

	return client, nil
}

func (a *AAPAuthHandler) Logout(token string, postLogoutBase string) (string, error) {
	data := url.Values{}
	data.Set("client_id", a.clientId)
	data.Set("token", token)

	httpClient := http.Client{
		Transport: &http.Transport{
			TLSClientConfig: a.tlsConfig,
		},
	}
	req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("%s/o/revoke_token/", a.internalAuthURL), bytes.NewBufferString(data.Encode()))
	if err != nil {
		log.GetLogger().WithError(err).Warn("failed to create http request")
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	res, err := httpClient.Do(req)
	if err != nil {
		// Token revocation failed; do not issue a browser redirect. Preserve the
		// original behavior of surfacing the error to the caller.
		log.GetLogger().WithError(err).Warn("Failed to logout")
		return "", err
	}
	defer func() {
		if cerr := res.Body.Close(); cerr != nil {
			log.GetLogger().WithError(cerr).Debug("failed to close revocation response body")
		}
	}()

	// A successful revocation returns a 2xx status. On any non-2xx response the token may
	// still be valid, so surface an error and do not issue the browser redirect.
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		revokeErr := fmt.Errorf("AAP token revocation failed with status %d", res.StatusCode)
		log.GetLogger().WithError(revokeErr).Warn("Failed to logout")
		return "", revokeErr
	}

	// The server-to-server token revocation above invalidates the OAuth token, but AAP
	// also keeps a browser session cookie (awx_sessionid) that revocation alone does not
	// clear. Return a redirect to AAP's session-termination endpoint so the browser's
	// visit clears that cookie; the "next" parameter then sends the user back to RHEM's
	// login page.
	//
	// AAP is built on Django/AWX. When AWX runs behind the AAP Gateway,
	// LoggedLogoutView.dispatch() in awx/api/generics.py redirects logout requests to the
	// Gateway's session-termination endpoint "/api/gateway/v1/logout/" (carrying a "next"
	// query parameter), so we send the browser directly there to terminate the Gateway
	// session.
	//
	// Security: both the redirect target and the "next" value are derived exclusively
	// from configured values -- a.internalAuthURL (provider config) and postLogoutBase
	// (resolved by the caller from an allow-listed origin or BASE_UI_URL). No
	// user-supplied URL fragment is incorporated, which prevents open-redirect
	// vulnerabilities.
	logoutURL, err := url.Parse(a.internalAuthURL)
	if err != nil {
		log.GetLogger().WithError(err).Warn("failed to parse AAP internal auth URL for logout redirect")
		return "", err
	}
	// JoinPath normalizes any duplicate or trailing slashes in the configured base URL and
	// preserves the trailing slash the Gateway expects on the logout path.
	logoutURL = logoutURL.JoinPath("api", "gateway", "v1", "logout/")
	q := logoutURL.Query()
	q.Set("next", postLogoutBase)
	logoutURL.RawQuery = q.Encode()

	return logoutURL.String(), nil
}

func (a *AAPAuthHandler) GetLoginRedirectURL(state string, codeChallenge string, redirectURI string) (string, error) {
	client, err := getAAPClient(a.authURL, a.tokenURL, a.tlsConfig, a.clientId, redirectURI)
	if err != nil {
		return "", fmt.Errorf("failed to create AAP OAuth client: %w", err)
	}
	return loginRedirect(client, state, codeChallenge), nil
}
