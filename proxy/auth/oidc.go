package auth

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/flightctl/flightctl-ui/common"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl/api/v1alpha1"
	"github.com/openshift/osincli"
	log "github.com/sirupsen/logrus"
)

type OIDCAuth struct {
	oidcTlsConfig      *tls.Config
	clientId           string
	oauthInfo          *oauthServerInfo
	authConfig         *v1alpha1.AuthConfig
	oidcClient         *osincli.Client
	internalOidcClient *osincli.Client
	secureOnly         bool
}

type oauthServerInfo struct {
	Config         oauthServerResponse
	InternalConfig oauthServerResponse
}

type oauthServerResponse struct {
	TokenEndpoint      string `json:"token_endpoint"`
	AuthEndpoint       string `json:"authorization_endpoint"`
	UserInfoEndpoint   string `json:"userinfo_endpoint"`
	EndSessionEndpoint string `json:"end_session_endpoint"`
}

type RedirectResponse struct {
	Url string `json:"url"`
}

type LoginParameters struct {
	Code string `json:"code"`
}

func NewOIDCAuth(oidcTlsConfig *tls.Config, apiTlsConfig *tls.Config, secureOnly bool) (*OIDCAuth, error) {
	oauthInfo, authConfig, err := getOIDCInfo(oidcTlsConfig, apiTlsConfig)
	if err != nil {
		return nil, err
	}

	if oauthInfo == nil {
		log.Info("Auth disabled")
		return &OIDCAuth{}, nil
	}

	oidcClient, err := getOIDCClient(oauthInfo.Config.AuthEndpoint, oauthInfo.Config.TokenEndpoint, oidcTlsConfig)
	if err != nil {
		log.Errorf("Failed to create OIDC client: %s", err.Error())
		return nil, err
	}

	internalOidcClient, err := getOIDCClient(oauthInfo.InternalConfig.AuthEndpoint, oauthInfo.InternalConfig.TokenEndpoint, oidcTlsConfig)
	if err != nil {
		log.Errorf("Failed to create internal OIDC client: %s", err.Error())
		return nil, err
	}

	return &OIDCAuth{
		oauthInfo:          oauthInfo,
		authConfig:         authConfig,
		oidcTlsConfig:      oidcTlsConfig,
		clientId:           config.OidcClientId,
		oidcClient:         oidcClient,
		internalOidcClient: internalOidcClient,
		secureOnly:         secureOnly,
	}, nil
}

func getOIDCInfo(oidcTlsConfig *tls.Config, apiTlsConfig *tls.Config) (*oauthServerInfo, *v1alpha1.AuthConfig, error) {
	client := &http.Client{Transport: &http.Transport{
		TLSClientConfig: apiTlsConfig,
	}}
	authConfigUrl := config.FctlApiUrl + "/api/v1/auth/config"

	req, err := http.NewRequest(http.MethodGet, authConfigUrl, nil)
	if err != nil {
		log.Warnf("Could not create request: %s", err.Error())
		return nil, nil, err
	}

	resp, err := client.Do(req)
	if err != nil {
		log.Warnf("Failed to get auth config: %s", err.Error())
		return nil, nil, err
	}

	if resp.StatusCode == http.StatusTeapot {
		return nil, nil, nil
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Warnf("Failed to read terminal session response %s", err.Error())
		return nil, nil, err
	}

	authConfig := v1alpha1.AuthConfig{}
	err = json.Unmarshal(body, &authConfig)
	if err != nil {
		log.Warnf("Failed to unmarshall auth config %s", err.Error())
		return nil, nil, err
	}

	authUrl := authConfig.AuthURL
	if config.InternalOIDCUrl != "" {
		authUrl = config.InternalOIDCUrl
	}

	oauthConfigUrl := fmt.Sprintf("%s/.well-known/oauth-authorization-server", authUrl)
	req, err = http.NewRequest(http.MethodGet, oauthConfigUrl, nil)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create http request: %w", err)
	}

	httpClient := http.Client{
		Transport: &http.Transport{
			TLSClientConfig: oidcTlsConfig,
		},
	}

	res, err := httpClient.Do(req)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to fetch oidc config: %w", err)
	}

	defer res.Body.Close()
	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to read oidc config: %w", err)
	}

	oauthResponse := oauthServerResponse{}
	if err := json.Unmarshal(bodyBytes, &oauthResponse); err != nil {
		return nil, nil, fmt.Errorf("failed to parse oidc config: %w", err)
	}

	oauthServerInfo := oauthServerInfo{
		Config:         oauthResponse,
		InternalConfig: oauthResponse,
	}

	if config.InternalOIDCUrl != "" {
		extOauth := oauthServerResponse{
			AuthEndpoint:       strings.Replace(oauthResponse.AuthEndpoint, config.InternalOIDCUrl, authConfig.AuthURL, 1),
			TokenEndpoint:      strings.Replace(oauthResponse.TokenEndpoint, config.InternalOIDCUrl, authConfig.AuthURL, 1),
			UserInfoEndpoint:   strings.Replace(oauthResponse.UserInfoEndpoint, config.InternalOIDCUrl, authConfig.AuthURL, 1),
			EndSessionEndpoint: strings.Replace(oauthResponse.EndSessionEndpoint, config.InternalOIDCUrl, authConfig.AuthURL, 1),
		}
		oauthServerInfo.Config = extOauth
	}

	return &oauthServerInfo, &authConfig, nil
}

func getOIDCClient(authEndpoint string, tokenEndpoint string, tlsConfig *tls.Config) (*osincli.Client, error) {
	oidcClientConfig := &osincli.ClientConfig{
		ClientId:           config.OidcClientId,
		AuthorizeUrl:       authEndpoint,
		TokenUrl:           tokenEndpoint,
		RedirectUrl:        config.BaseUiUrl + "/callback",
		ErrorsInStatusCode: true,
		Scope:              "openid",
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

func (o *OIDCAuth) Login(w http.ResponseWriter, r *http.Request) {
	if o.oauthInfo == nil {
		w.WriteHeader(http.StatusTeapot)
		return
	}
	if r.Method == "POST" {
		o.exchangeToken(w, r)
	} else {
		o.loginRedirect(w, r)
	}
}

func (o *OIDCAuth) loginRedirect(w http.ResponseWriter, r *http.Request) {
	authorizeRequest := o.oidcClient.NewAuthorizeRequest(osincli.CODE)
	loginUrl := authorizeRequest.GetAuthorizeUrl().String()
	response, err := json.Marshal(RedirectResponse{Url: loginUrl})
	if err != nil {
		log.Warnf("Failed to marshal response: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(response)
}

func (o *OIDCAuth) exchangeToken(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Warnf("Failed to read request body: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	loginParams := LoginParameters{}
	err = json.Unmarshal(body, &loginParams)
	if err != nil {
		log.Warnf("Failed to unmarshall request body: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	treq := o.internalOidcClient.NewAccessRequest(osincli.AUTHORIZATION_CODE, &osincli.AuthorizeData{
		Code: loginParams.Code,
	})

	// exchange the authorize token for the access token
	ad, err := treq.GetToken()
	if err != nil {
		log.Warnf("Failed to get token: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	cookie := http.Cookie{
		Name:     common.CookieSessionName,
		Value:    ad.AccessToken,
		Secure:   o.secureOnly,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	}
	http.SetCookie(w, &cookie)
	w.Write([]byte("Session cookie set"))
}

func (o *OIDCAuth) GetUserInfo(w http.ResponseWriter, r *http.Request) {
	if o.oauthInfo == nil {
		w.WriteHeader(http.StatusTeapot)
		return
	}

	cookie, err := r.Cookie(common.CookieSessionName)
	if err != nil || cookie == nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	client := &http.Client{Transport: &http.Transport{
		TLSClientConfig: o.oidcTlsConfig,
	}}

	req, err := http.NewRequest(http.MethodGet, o.oauthInfo.InternalConfig.UserInfoEndpoint, nil)
	if err != nil {
		log.Warnf("Failed to create http request: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	req.Header.Add(common.AuthHeaderKey, "Bearer "+cookie.Value)

	proxyUrl, err := url.Parse(o.authConfig.AuthURL)
	if err != nil {
		log.Warnf("Failed to parse proxy url: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	req.Header.Add("X-Forwarded-Host", proxyUrl.Host)
	req.Header.Add("X-Forwarded-Proto", proxyUrl.Scheme)

	resp, err := client.Do(req)
	if err != nil {
		log.Warnf("Failed to get user info: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if resp.StatusCode != http.StatusOK {
		w.WriteHeader(resp.StatusCode)
		return
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Warnf("Failed to read response body: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(body)
}

func (o *OIDCAuth) Logout(w http.ResponseWriter, r *http.Request) {
	if o.oauthInfo == nil {
		w.WriteHeader(http.StatusTeapot)
		return
	}

	u, err := url.Parse(o.oauthInfo.Config.EndSessionEndpoint)
	if err != nil {
		log.Warnf("Failed to parse OAuth response: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	uq := u.Query()
	uq.Add("post_logout_redirect_uri", config.BaseUiUrl)
	uq.Add("client_id", o.clientId)
	u.RawQuery = uq.Encode()
	response, err := json.Marshal(RedirectResponse{Url: u.String()})
	if err != nil {
		log.Warnf("Failed to marshal response: %s", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(response)
}
