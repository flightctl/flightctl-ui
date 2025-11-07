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

	"github.com/flightctl/flightctl-ui/common"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
)

type TokenData struct {
	Token        string `json:"token"`
	RefreshToken string `json:"refreshToken"`
	Provider     string `json:"provider,omitempty"`
}

type LoginParameters struct {
	Code string `json:"code"`
}

type AuthProvider interface {
	GetToken(loginParams LoginParameters) (TokenData, *int64, error)
	GetUserInfo(token string) (string, *http.Response, error)
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

func clearCookie(w http.ResponseWriter) {
	cookie := http.Cookie{
		Name:     common.CookieSessionName,
		Value:    "",
		Secure:   config.TlsCertPath != "",
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
		MaxAge:   -1,
	}
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

		err = json.Unmarshal(val, &tokenData)
		return tokenData, err
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

type ErrorResponse struct {
	Error string `json:"error"`
}

func respondWithError(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	errorResp := ErrorResponse{Error: message}
	response, err := json.Marshal(errorResp)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to marshal error response")
		return
	}
	if _, err := w.Write(response); err != nil {
		log.GetLogger().WithError(err).Warn("Failed to write error response")
	}
}
