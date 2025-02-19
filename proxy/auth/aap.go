package auth

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/flightctl/flightctl-ui/bridge"
	"github.com/flightctl/flightctl-ui/common"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/openshift/osincli"
	log "github.com/sirupsen/logrus"
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
	if resp.StatusCode == 201 {
		resp.StatusCode = 200
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

func (a *AAPAuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	OAuthLogin(w, r, a.client, a.internalClient)
}

func (a *AAPAuthHandler) GetUserInfo(w http.ResponseWriter, r *http.Request) {
	userInfoEndpoint := fmt.Sprintf("%s/api/gateway/v1/me/", a.internalAuthURL)
	resp, statusCode := GetUserInfo(r, a.tlsConfig, a.authURL, userInfoEndpoint)

	if statusCode != http.StatusOK {
		w.WriteHeader(statusCode)
		return
	}

	userInfo := AAPUserInfo{}
	if err := json.Unmarshal(resp, &userInfo); err != nil {
		log.Warnf("Failed to unmarshall user info: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if len(userInfo.Results) == 0 {
		log.Warn("No user results available")
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	body, err := json.Marshal(UserInfoResponse{Username: userInfo.Results[0].Username})
	if err != nil {
		log.Warnf("Failed to marshall user info: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if _, err := w.Write(body); err != nil {
		log.Warnf("Failed to write response: %s", err.Error())
	}
}

func (a *AAPAuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(common.CookieSessionName)
	if err != nil || cookie == nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	data := url.Values{}
	data.Set("client_id", config.AuthClientId)
	data.Set("token", cookie.Value)

	httpClient := http.Client{
		Transport: &http.Transport{
			TLSClientConfig: a.tlsConfig,
		},
	}
	req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("%s/o/revoke_token/", a.internalAuthURL), bytes.NewBufferString(data.Encode()))
	if err != nil {
		log.Warnf("failed to create http request: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	_, err = httpClient.Do(req)
	if err != nil {
		log.Warnf("Failed to logout: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	RemoveCookie(w)
	response, err := json.Marshal(RedirectResponse{})
	if err != nil {
		log.Warnf("Failed to marshal response: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(response)
}
