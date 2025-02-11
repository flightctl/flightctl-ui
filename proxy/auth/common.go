package auth

import (
	"crypto/tls"
	b64 "encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/flightctl/flightctl-ui/common"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
)

type TokenData struct {
	Token        string `json:"token"`
	RefreshToken string `json:"refreshToken"`
}

type LoginParameters struct {
	Code string `json:"code"`
}

type AuthProvider interface {
	GetToken(loginParams LoginParameters) (TokenData, *int64, error)
	GetUserInfo(token string) (string, error)
	RefreshToken(refreshToken string) (TokenData, *int64, error)
	Logout(token string) (string, error)
	GetLoginRedirectURL() string
}

func setCookie(w http.ResponseWriter, value TokenData) error {
	cookieVal, err := json.Marshal(value)
	if err != nil {
		return err
	}
	cookie := http.Cookie{
		Name:     common.CookieSessionName,
		Value:    b64.StdEncoding.EncodeToString(cookieVal),
		Secure:   config.TlsCertPath != "",
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	}
	http.SetCookie(w, &cookie)
	return nil
}

func removeCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:    common.CookieSessionName,
		Value:   "",
		Path:    "/",
		Expires: time.Unix(0, 0),
		MaxAge:  -1,
	})
}

func ParseSessionCookie(r *http.Request) (TokenData, error) {
	tokenData := TokenData{}
	cookie, err := r.Cookie(common.CookieSessionName)
	if err != nil && !errors.Is(err, http.ErrNoCookie) {
		return tokenData, err
	}

	if cookie != nil {
		val, err := b64.StdEncoding.DecodeString(cookie.Value)
		if err != nil {
			return tokenData, err
		}

		err = json.Unmarshal(val, &tokenData)
		return tokenData, err
	}
	return tokenData, nil
}

func getUserInfo(token string, tlsConfig *tls.Config, authURL string, userInfoEndpoint string) ([]byte, int) {
	client := &http.Client{Transport: &http.Transport{
		TLSClientConfig: tlsConfig,
	}}

	req, err := http.NewRequest(http.MethodGet, userInfoEndpoint, nil)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to create http request")
		return []byte{}, http.StatusInternalServerError
	}

	req.Header.Add(common.AuthHeaderKey, "Bearer "+token)

	proxyUrl, err := url.Parse(authURL)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to parse proxy url")
		return []byte{}, http.StatusInternalServerError
	}
	req.Header.Add("X-Forwarded-Host", proxyUrl.Host)
	req.Header.Add("X-Forwarded-Proto", proxyUrl.Scheme)

	resp, err := client.Do(req)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to get user info")
		return []byte{}, http.StatusInternalServerError
	}

	if resp.StatusCode != http.StatusOK {
		return []byte{}, resp.StatusCode
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to read response body")
		return []byte{}, http.StatusInternalServerError
	}
	return body, resp.StatusCode
}

func getToken(r *http.Request) string {
	token := r.Header.Get(common.AuthHeaderKey)
	return strings.TrimPrefix(token, "Bearer ")
}
