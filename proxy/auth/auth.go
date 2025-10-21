package auth

import (
	"crypto/rand"
	"crypto/tls"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
	"github.com/flightctl/flightctl/api/v1alpha1"
)

const (
	DefaultTokenCleanupInterval = 10 * time.Minute // How often to run cleanup
	DefaultTokenMaxAge          = 15 * time.Minute // Max age before forced removal
)

type ExpiresInResp struct {
	ExpiresIn *int64 `json:"expiresIn"`
}

type UserInfoResponse struct {
	AuthType string `json:"authType"`
	Username string `json:"username,omitempty"`
}

type SessionTokenResponse struct {
	Token      string `json:"token"`
	ServiceUrl string `json:"serviceUrl"`
}

type RedirectResponse struct {
	Url string `json:"url"`
}

type AuthHandler struct {
	provider         AuthProvider
	sessionMutex     sync.Mutex
	apiTokenMap      map[string]*ApiToken
	stopTokenCleanup chan struct{}
}

type ApiToken struct {
	Token     string
	ExpiresIn *int64
	CreatedAt time.Time
}

func NewAuth(apiTlsConfig *tls.Config) (*AuthHandler, error) {
	auth := AuthHandler{
		apiTokenMap:      make(map[string]*ApiToken),
		stopTokenCleanup: make(chan struct{}),
	}
	authConfig, internalAuthUrl, err := getAuthInfo(apiTlsConfig)
	if err != nil {
		return nil, err
	}

	if authConfig == nil {
		log.GetLogger().Info("Auth disabled")
		return &auth, nil
	}

	switch authConfig.AuthType {
	case "AAPGateway":
		auth.provider, err = getAAPAuthHandler(authConfig.AuthURL, internalAuthUrl)
	case "OIDC":
		auth.provider, err = getOIDCAuthHandler(authConfig.AuthURL, internalAuthUrl)
	default:
		err = fmt.Errorf("unknown auth type: %s", authConfig.AuthType)
	}

	if err == nil && auth.provider != nil {
		// Start the cleanup routine for expired tokens
		go auth.startTokenCleanup()
	}

	return &auth, err
}

func (a *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if a.provider == nil {
		w.WriteHeader(http.StatusTeapot)
		return
	}
	if r.Method == http.MethodPost {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			log.GetLogger().WithError(err).Warn("Failed to read request body")
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		loginParams := LoginParameters{}
		err = json.Unmarshal(body, &loginParams)
		if err != nil {
			log.GetLogger().WithError(err).Warn("Failed to unmarshal request body")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		tokenData, expires, err := a.provider.GetToken(loginParams)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		respondWithToken(w, tokenData, expires)
	} else {

		forceReauth := r.URL.Query().Get("force") == "true"
		loginUrl := a.provider.GetLoginRedirectURL(forceReauth)
		response, err := json.Marshal(RedirectResponse{Url: loginUrl})
		if err != nil {
			log.GetLogger().WithError(err).Warn("Failed to marshal response")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		if _, err := w.Write(response); err != nil {
			log.GetLogger().WithError(err).Warn("Failed to write response")
		}
	}
}

func (a *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	if a.provider == nil {
		w.WriteHeader(http.StatusTeapot)
		return
	}
	tokenData, err := ParseSessionCookie(r)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	tokenData, expires, err := a.provider.RefreshToken(tokenData.RefreshToken)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	respondWithToken(w, tokenData, expires)
}

func respondWithToken(w http.ResponseWriter, tokenData TokenData, expires *int64) {
	err := setCookie(w, tokenData)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	exp, err := json.Marshal(ExpiresInResp{ExpiresIn: expires})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if _, err := w.Write(exp); err != nil {
		log.GetLogger().WithError(err).Warn("Failed to write response")
	}
}

func (a *AuthHandler) GetUserInfo(w http.ResponseWriter, r *http.Request) {
	if a.provider == nil {
		w.WriteHeader(http.StatusTeapot)
		return
	}

	token, err := getToken(r)
	if token == "" || err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	username, resp, err := a.provider.GetUserInfo(token)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to get user info")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if resp.StatusCode != http.StatusOK {
		w.WriteHeader(resp.StatusCode)
		return
	}
	userInfo := UserInfoResponse{Username: username, AuthType: a.provider.GetAuthType()}
	res, err := json.Marshal(userInfo)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to marshal user info")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if _, err := w.Write(res); err != nil {
		log.GetLogger().WithError(err).Warn("Failed to write response")
	}
}

// Creates a cryptographically secure random session ID
func generateSessionId() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func (a *AuthHandler) storeApiTokenMapping(tokenData TokenData, expires *int64) (string, error) {
	sessionId, err := generateSessionId()
	if err != nil {
		return "", err
	}

	session := &ApiToken{
		Token:     tokenData.Token,
		ExpiresIn: expires,
		CreatedAt: time.Now(),
	}

	a.sessionMutex.Lock()
	a.apiTokenMap[sessionId] = session
	a.sessionMutex.Unlock()

	return sessionId, nil
}

// Gets the auth token associated to a given sessionId.
// Deletes the mapping immediately after retrieval so it can only be used once.
func (a *AuthHandler) getSingleUseApiTokenMapping(sessionId string) (*ApiToken, bool) {
	a.sessionMutex.Lock()
	defer a.sessionMutex.Unlock()

	session, exists := a.apiTokenMap[sessionId]
	if exists {
		delete(a.apiTokenMap, sessionId)
	}
	return session, exists
}

// Cleans up expired and old tokens that were never retrieved through getSingleUseApiTokenMapping
func (a *AuthHandler) startTokenCleanup() {
	ticker := time.NewTicker(DefaultTokenCleanupInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			a.cleanupExpiredTokens()
		case <-a.stopTokenCleanup:
			return
		}
	}
}

// Removes expired tokens and tokens older than DefaultMaxTokenAge from the apiTokenMap
func (a *AuthHandler) cleanupExpiredTokens() {
	a.sessionMutex.Lock()
	defer a.sessionMutex.Unlock()

	now := time.Now()
	deletedTokens := 0

	for sessionId, token := range a.apiTokenMap {
		shouldRemove := false

		if now.Sub(token.CreatedAt) > DefaultTokenMaxAge {
			// Remove tokens older than the directed max age
			shouldRemove = true
		} else if token.ExpiresIn != nil {
			// Remove expired tokens (if ExpiresIn is set)
			expiration := token.CreatedAt.Add(time.Duration(*token.ExpiresIn) * time.Second)
			if now.After(expiration) {
				shouldRemove = true
			}
		}

		if shouldRemove {
			delete(a.apiTokenMap, sessionId)
			deletedTokens++
		}
	}

	if deletedTokens > 0 {
		log.GetLogger().WithFields(map[string]interface{}{
			"deletedTokens":   deletedTokens,
			"remainingTokens": len(a.apiTokenMap),
		}).Info("Cleaned up expired API tokens")
	}
}

func (a *AuthHandler) StopTokenCleanup() {
	close(a.stopTokenCleanup)
}

func (a *AuthHandler) CreateSessionToken(w http.ResponseWriter, r *http.Request) {
	if a.provider == nil {
		w.WriteHeader(http.StatusTeapot)
		return
	}
	if r.Method == http.MethodPost {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			log.GetLogger().WithError(err).Warn("Failed to read request body")
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		loginParams := LoginParameters{}
		err = json.Unmarshal(body, &loginParams)
		if err != nil {
			log.GetLogger().WithError(err).Warn("Failed to unmarshal request body")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		tokenData, expires, err := a.provider.GetToken(loginParams)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		// Store the token, mapping it to a new sessionId that can be used to access the token only once.
		sessionId, err := a.storeApiTokenMapping(tokenData, expires)
		if err != nil {
			log.GetLogger().WithError(err).Warn("Failed to store API token session")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		// Keep the token stored internally and return the associated sessionId
		response := map[string]string{"sessionId": sessionId}
		jsonResponse, err := json.Marshal(response)
		if err != nil {
			log.GetLogger().WithError(err).Warn("Failed to marshal session response")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if _, err := w.Write(jsonResponse); err != nil {
			log.GetLogger().WithError(err).Warn("Failed to write session response")
		}
	} else {
		// Always force fresh authentication. This allow us to get a different token than the current user token
		loginUrl := a.provider.GetLoginRedirectURL(true)

		response, err := json.Marshal(RedirectResponse{Url: loginUrl})
		if err != nil {
			log.GetLogger().WithError(err).Warn("Failed to marshal response")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		if _, err := w.Write(response); err != nil {
			log.GetLogger().WithError(err).Warn("Failed to write response")
		}
	}
}

func getExternalServiceUrl() string {
	if config.FctlApiUrlExternal == "" {
		return config.FctlApiUrl
	}
	return config.FctlApiUrlExternal
}

func (a *AuthHandler) GetSessionToken(w http.ResponseWriter, r *http.Request) {
	if a.provider == nil {
		w.WriteHeader(http.StatusTeapot)
		return
	}

	sessionId := r.URL.Query().Get("sessionId")
	if sessionId == "" {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Retrieve the token associated to the sessionId, and delete the mapping so it can not be used again.
	session, exists := a.getSingleUseApiTokenMapping(sessionId)
	if !exists {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	response := SessionTokenResponse{ServiceUrl: getExternalServiceUrl(), Token: session.Token}
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to marshal API token response")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if _, err := w.Write(jsonResponse); err != nil {
		log.GetLogger().WithError(err).Warn("Failed to write API token response")
	}
}

func (a *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	if a.provider == nil {
		w.WriteHeader(http.StatusTeapot)
		return
	}

	token, err := getToken(r)
	if token == "" || err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	redirectUrl, err := a.provider.Logout(token)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to logout")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Clear-Site-Data", `"cookies"`)
	redirectResp := RedirectResponse{}
	if redirectUrl != "" {
		redirectResp.Url = redirectUrl
	}
	response, err := json.Marshal(redirectResp)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to marshal response")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	if _, err := w.Write(response); err != nil {
		log.GetLogger().WithError(err).Warn("Failed to write response")
	}
}

func getAuthInfo(apiTlsConfig *tls.Config) (*v1alpha1.AuthConfig, *string, error) {
	client := &http.Client{Transport: &http.Transport{
		TLSClientConfig: apiTlsConfig,
	}}
	authConfigUrl := config.FctlApiUrl + "/api/v1/auth/config"

	req, err := http.NewRequest(http.MethodGet, authConfigUrl, nil)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Could not create request")
		return nil, nil, err
	}

	resp, err := client.Do(req)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to get auth config")
		return nil, nil, err
	}

	if resp.StatusCode == http.StatusTeapot {
		return nil, nil, nil
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to read terminal session response")
		return nil, nil, err
	}

	authConfig := &v1alpha1.AuthConfig{}
	err = json.Unmarshal(body, authConfig)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to unmarshal auth config")
		return nil, nil, err
	}

	if config.InternalAuthUrl == "" {
		return authConfig, nil, nil
	}
	return authConfig, &config.InternalAuthUrl, nil
}
