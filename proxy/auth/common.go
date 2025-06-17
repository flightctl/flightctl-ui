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
	GetToken(loginParams LoginParameters, r *http.Request) (TokenData, *int64, error)
	GetUserInfo(token string) (string, *http.Response, error)
	RefreshToken(refreshToken string, r *http.Request) (TokenData, *int64, error)
	Logout(token string) (string, error)
	GetLoginRedirectURL() (string, string)
}

func createCookie(name, value string) http.Cookie {
	return http.Cookie{
		Name:     name,
		Value:    value,
		Secure:   config.TlsCertPath != "",
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	}
}

func setCookie(w http.ResponseWriter, value TokenData) error {
	cookieVal, err := json.Marshal(TokenData{Token: value.Token})
	if err != nil {
		return err
	}
	tokenCookie := createCookie(common.CookieSessionName, b64.StdEncoding.EncodeToString(cookieVal))
	refreshCookie := createCookie(common.CookieRefreshSessionName, value.RefreshToken)
	http.SetCookie(w, &tokenCookie)
	http.SetCookie(w, &refreshCookie)
	return nil
}

func removeCookie(w http.ResponseWriter, cookieName string) {
	cookie := createCookie(cookieName, "")
	cookie.Expires = time.Unix(0, 0)
	http.SetCookie(w, &cookie)
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
		if err := json.Unmarshal(val, &tokenData); err != nil {
			return tokenData, err
		}
	}

	refreshCookie, err := r.Cookie(common.CookieRefreshSessionName)
	if err != nil && !errors.Is(err, http.ErrNoCookie) {
		return tokenData, err
	}

	if refreshCookie != nil {
		tokenData.RefreshToken = refreshCookie.Value
	}

	return tokenData, nil
}

func getUserInfo(token string, tlsConfig *tls.Config, authURL string, userInfoEndpoint string) (*[]byte, *http.Response, error) {
	client := &http.Client{Transport: &http.Transport{
		TLSClientConfig: tlsConfig,
	}}

	req, err := http.NewRequest(http.MethodGet, userInfoEndpoint, nil)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to create http request")
		return nil, nil, err
	}

	req.Header.Add(common.AuthHeaderKey, "Bearer "+token)

	proxyUrl, err := url.Parse(authURL)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to parse proxy url")
		return nil, nil, err
	}
	req.Header.Add("X-Forwarded-Host", proxyUrl.Host)
	req.Header.Add("X-Forwarded-Proto", proxyUrl.Scheme)

	resp, err := client.Do(req)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to get user info")
		return nil, nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.GetLogger().WithError(err).Warn("Failed to read response body")
			return nil, resp, err
		}
		return &body, resp, nil
	}

	return nil, resp, nil
}

func getToken(r *http.Request) (string, error) {
	headerVal := r.Header.Get(common.AuthHeaderKey)
	token := strings.TrimPrefix(headerVal, "Bearer ")
	if token == headerVal {
		return "", errors.New("incorrect auth header value")
	}
	token = strings.TrimSpace(token)
	return token, nil
}
