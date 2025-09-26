package auth

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/flightctl/flightctl-ui/bridge"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
	"github.com/openshift/osincli"
)

type AAPAuthHandler struct {
	client          *osincli.Client
	internalClient  *osincli.Client
	tlsConfig       *tls.Config
	authURL         string
	internalAuthURL string
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

func getAAPAuthHandler(authURL string, internalAuthURL *string) (*AAPAuthHandler, error) {
	tlsConfig, err := bridge.GetAuthTlsConfig()
	if err != nil {
		return nil, err
	}

	client, err := getClient(authURL, tlsConfig)
	if err != nil {
		return nil, err
	}

	handler := &AAPAuthHandler{
		client:          client,
		internalClient:  client,
		tlsConfig:       tlsConfig,
		authURL:         authURL,
		internalAuthURL: authURL,
	}

	if internalAuthURL != nil {
		internalClient, err := getClient(*internalAuthURL, tlsConfig)
		if err != nil {
			return nil, err
		}
		handler.internalClient = internalClient
		handler.internalAuthURL = *internalAuthURL
	}

	return handler, nil
}

func getClient(url string, tlsConfig *tls.Config) (*osincli.Client, error) {
	oidcClientConfig := &osincli.ClientConfig{
		ClientId:                 config.AuthClientId,
		AuthorizeUrl:             fmt.Sprintf("%s/o/authorize/", url),
		TokenUrl:                 fmt.Sprintf("%s/o/token/", url),
		RedirectUrl:              config.BaseUiUrl + "/callback",
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

func (a *AAPAuthHandler) GetToken(loginParams LoginParameters) (TokenData, *int64, error) {
	return exchangeToken(loginParams, a.internalClient)
}

func (a *AAPAuthHandler) GetUserInfo(token string) (string, *http.Response, error) {
	userInfoEndpoint := fmt.Sprintf("%s/api/gateway/v1/me/", a.internalAuthURL)
	body, resp, err := getUserInfo(token, a.tlsConfig, a.authURL, userInfoEndpoint)

	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to get user info")
		return "", resp, err
	}

	if body != nil {
		userInfo := AAPUserInfo{}
		if err := json.Unmarshal(*body, &userInfo); err != nil {
			log.GetLogger().WithError(err).Warn("Failed to unmarshal user info")
			return "", resp, err
		}

		if len(userInfo.Results) == 0 {
			log.GetLogger().Warn("No user results available")
			return "", resp, fmt.Errorf("no user available")
		}
		return userInfo.Results[0].Username, resp, nil
	}
	return "", resp, nil
}

func (a *AAPAuthHandler) Logout(token string) (string, error) {
	data := url.Values{}
	data.Set("client_id", config.AuthClientId)
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

func (a *AAPAuthHandler) RefreshToken(refreshToken string) (TokenData, *int64, error) {
	return refreshOAuthToken(refreshToken, a.internalClient)
}

func (a *AAPAuthHandler) GetLoginRedirectURL(forceReauth bool) string {
	return loginRedirect(a.client, forceReauth)
}

func (a *AAPAuthHandler) GetAuthType() string {
	return "AAPGateway"
}
