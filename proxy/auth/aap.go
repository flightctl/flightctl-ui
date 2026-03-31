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

func (a *AAPAuthHandler) Logout(token string, _ string) (string, error) {
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
		log.GetLogger().WithError(err).Warn("Failed to logout")
		return "", err
	}
	defer res.Body.Close()
	return "", nil
}

func (a *AAPAuthHandler) GetLoginRedirectURL(state string, codeChallenge string, redirectURI string) (string, error) {
	client, err := getAAPClient(a.authURL, a.tokenURL, a.tlsConfig, a.clientId, redirectURI)
	if err != nil {
		return "", fmt.Errorf("failed to create AAP OAuth client: %w", err)
	}
	return loginRedirect(client, state, codeChallenge), nil
}
