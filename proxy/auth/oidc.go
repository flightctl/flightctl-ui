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
	"github.com/openshift/osincli"
	log "github.com/sirupsen/logrus"
)

type OIDCUserInfo struct {
	Username string `json:"preferred_username,omitempty"`
}

type OIDCAuthHandler struct {
	tlsConfig          *tls.Config
	client             *osincli.Client
	internalClient     *osincli.Client
	endSessionEndpoint string
	userInfoEndpoint   string
	authURL            string
}

type oidcServerResponse struct {
	TokenEndpoint      string `json:"token_endpoint"`
	AuthEndpoint       string `json:"authorization_endpoint"`
	UserInfoEndpoint   string `json:"userinfo_endpoint"`
	EndSessionEndpoint string `json:"end_session_endpoint"`
}

func getOIDCAuthHandler(authURL string, internalAuthURL *string) (*OIDCAuthHandler, error) {
	tlsConfig, err := bridge.GetAuthTlsConfig()
	if err != nil {
		return nil, err
	}

	url := authURL
	if internalAuthURL != nil {
		url = *internalAuthURL
	}

	oauthConfigUrl := fmt.Sprintf("%s/.well-known/oauth-authorization-server", url)
	req, err := http.NewRequest(http.MethodGet, oauthConfigUrl, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create http request: %w", err)
	}

	httpClient := http.Client{
		Transport: &http.Transport{
			TLSClientConfig: tlsConfig,
		},
	}

	res, err := httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch oidc config: %w", err)
	}

	defer res.Body.Close()
	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read oidc config: %w", err)
	}

	oidcResponse := oidcServerResponse{}
	if err := json.Unmarshal(bodyBytes, &oidcResponse); err != nil {
		return nil, fmt.Errorf("failed to parse oidc config: %w", err)
	}

	internalClient, err := getOIDCClient(oidcResponse, tlsConfig)
	if err != nil {
		return nil, err
	}

	handler := &OIDCAuthHandler{
		tlsConfig:          tlsConfig,
		internalClient:     internalClient,
		client:             internalClient,
		endSessionEndpoint: oidcResponse.EndSessionEndpoint,
		userInfoEndpoint:   oidcResponse.UserInfoEndpoint,
		authURL:            authURL,
	}

	if internalAuthURL != nil {
		extConfig := oidcServerResponse{
			AuthEndpoint:       strings.Replace(oidcResponse.AuthEndpoint, *internalAuthURL, authURL, 1),
			TokenEndpoint:      strings.Replace(oidcResponse.TokenEndpoint, *internalAuthURL, authURL, 1),
			UserInfoEndpoint:   strings.Replace(oidcResponse.UserInfoEndpoint, *internalAuthURL, authURL, 1),
			EndSessionEndpoint: strings.Replace(oidcResponse.EndSessionEndpoint, *internalAuthURL, authURL, 1),
		}
		client, err := getOIDCClient(extConfig, tlsConfig)
		if err != nil {
			return nil, err
		}
		handler.client = client
		handler.endSessionEndpoint = extConfig.EndSessionEndpoint
	}

	return handler, nil
}

func getOIDCClient(oidcConfig oidcServerResponse, tlsConfig *tls.Config) (*osincli.Client, error) {
	oidcClientConfig := &osincli.ClientConfig{
		ClientId:                 config.AuthClientId,
		AuthorizeUrl:             oidcConfig.AuthEndpoint,
		TokenUrl:                 oidcConfig.TokenEndpoint,
		RedirectUrl:              config.BaseUiUrl + "/callback",
		ErrorsInStatusCode:       true,
		SendClientSecretInParams: false,
		Scope:                    "openid",
	}

	client, err := osincli.NewClient(oidcClientConfig)
	if err != nil {
		return nil, err
	}

	client.Transport = &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	return client, nil
}

func (a *OIDCAuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	OAuthLogin(w, r, a.client, a.internalClient)
}

func (o *OIDCAuthHandler) GetUserInfo(w http.ResponseWriter, r *http.Request) {
	resp, statusCode := GetUserInfo(r, o.tlsConfig, o.authURL, o.userInfoEndpoint)

	if statusCode != http.StatusOK {
		w.WriteHeader(statusCode)
		return
	}

	userInfo := OIDCUserInfo{}
	if err := json.Unmarshal(resp, &userInfo); err != nil {
		log.Warnf("Failed to unmarshall user info: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	body, err := json.Marshal(UserInfoResponse(userInfo))
	if err != nil {
		log.Warnf("Failed to marshall user info: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Write(body)
}

func (o *OIDCAuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	u, err := url.Parse(o.endSessionEndpoint)
	if err != nil {
		log.Warnf("Failed to parse OAuth response: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	uq := u.Query()
	uq.Add("post_logout_redirect_uri", config.BaseUiUrl)
	uq.Add("client_id", config.AuthClientId)
	u.RawQuery = uq.Encode()
	response, err := json.Marshal(RedirectResponse{Url: u.String()})
	if err != nil {
		log.Warnf("Failed to marshal response: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	RemoveCookie(w)
	w.Write(response)
}
