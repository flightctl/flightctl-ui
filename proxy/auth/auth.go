package auth

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/flightctl/flightctl-ui/common"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl/api/v1alpha1"
	log "github.com/sirupsen/logrus"
)

type UserInfoResponse struct {
	Username string `json:"username,omitempty"`
}

type RedirectResponse struct {
	Url string `json:"url"`
}

type AuthHandler interface {
	Login(w http.ResponseWriter, r *http.Request)
	GetUserInfo(w http.ResponseWriter, r *http.Request)
	Logout(w http.ResponseWriter, r *http.Request)
}

func NewAuth(apiTlsConfig *tls.Config) (AuthHandler, error) {
	authConfig, internalAuthUrl, err := getAuthInfo(apiTlsConfig)
	if err != nil {
		return nil, err
	}

	if authConfig == nil {
		log.Info("Auth disabled")
		return &NilAuth{}, nil
	}

	if authConfig.AuthType == "AAPGateway" {
		return getAAPAuthHandler(authConfig.AuthURL, internalAuthUrl)
	}

	if authConfig.AuthType == "OIDC" {
		return getOIDCAuthHandler(authConfig.AuthURL, internalAuthUrl)
	}

	return nil, fmt.Errorf("unknown auth type: %s", authConfig.AuthType)
}

func getAuthInfo(apiTlsConfig *tls.Config) (*v1alpha1.AuthConfig, *string, error) {
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

	authConfig := &v1alpha1.AuthConfig{}
	err = json.Unmarshal(body, authConfig)
	if err != nil {
		log.Warnf("Failed to unmarshall auth config %s", err.Error())
		return nil, nil, err
	}

	if config.InternalAuthUrl == "" {
		return authConfig, nil, nil
	}
	return authConfig, &config.InternalAuthUrl, nil
}

func SetCookie(w http.ResponseWriter, value string) {
	cookie := http.Cookie{
		Name:     common.CookieSessionName,
		Value:    value,
		Secure:   config.TlsCertPath != "",
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	}
	http.SetCookie(w, &cookie)
	w.Write([]byte("Session cookie set"))
}

func RemoveCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:    common.CookieSessionName,
		Value:   "",
		Path:    "/",
		Expires: time.Unix(0, 0),
		MaxAge:  -1,
	})
}

func GetUserInfo(r *http.Request, tlsConfig *tls.Config, authURL string, userInfoEndpoint string) ([]byte, int) {
	cookie, err := r.Cookie(common.CookieSessionName)
	if err != nil || cookie == nil {
		return []byte{}, http.StatusUnauthorized
	}

	client := &http.Client{Transport: &http.Transport{
		TLSClientConfig: tlsConfig,
	}}

	req, err := http.NewRequest(http.MethodGet, userInfoEndpoint, nil)
	if err != nil {
		log.Warnf("Failed to create http request: %s", err.Error())
		return []byte{}, http.StatusInternalServerError
	}

	req.Header.Add(common.AuthHeaderKey, "Bearer "+cookie.Value)

	proxyUrl, err := url.Parse(authURL)
	if err != nil {
		log.Warnf("Failed to parse proxy url: %s", err.Error())
		return []byte{}, http.StatusInternalServerError
	}
	req.Header.Add("X-Forwarded-Host", proxyUrl.Host)
	req.Header.Add("X-Forwarded-Proto", proxyUrl.Scheme)

	resp, err := client.Do(req)
	if err != nil {
		log.Warnf("Failed to get user info: %s", err.Error())
		return []byte{}, http.StatusInternalServerError
	}

	if resp.StatusCode != http.StatusOK {
		return []byte{}, resp.StatusCode
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Warnf("Failed to read response body: %s", err.Error())
		return []byte{}, http.StatusInternalServerError
	}
	return body, resp.StatusCode
}

type NilAuth struct{}

func (*NilAuth) Login(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusTeapot)
}

func (*NilAuth) GetUserInfo(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusTeapot)
}

func (*NilAuth) Logout(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusTeapot)
}
