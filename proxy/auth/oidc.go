package auth

import (
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"slices"

	"github.com/flightctl/flightctl-ui/bridge"
	"github.com/flightctl/flightctl-ui/common"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
	"github.com/openshift/osincli"
	"golang.org/x/oauth2"

	"github.com/lestrrat-go/jwx/v2/jwt"
)

type OIDCRoundTripper struct {
	Transport http.RoundTripper
	Origin    string
}

func (c *OIDCRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	req.Header.Add("Origin", c.Origin)
	return c.Transport.RoundTrip(req)
}

type OIDCUserInfo struct {
	Username string `json:"preferred_username,omitempty"`
}

type OIDCAuthHandler struct {
	tlsConfig          *tls.Config
	authURL            string
	oidcConfig         oidcServerResponse
	internalOidcConfig oidcServerResponse
}

type oidcServerResponse struct {
	TokenEndpoint       string   `json:"token_endpoint"`
	AuthEndpoint        string   `json:"authorization_endpoint"`
	UserInfoEndpoint    string   `json:"userinfo_endpoint"`
	EndSessionEndpoint  string   `json:"end_session_endpoint"`
	CodeChallengeMethod []string `json:"code_challenge_methods_supported"`
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

	oauthConfigUrl := fmt.Sprintf("%s/.well-known/openid-configuration", url)
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

	handler := &OIDCAuthHandler{
		tlsConfig:          tlsConfig,
		authURL:            authURL,
		oidcConfig:         oidcResponse,
		internalOidcConfig: oidcResponse,
	}

	if internalAuthURL != nil {
		extConfig := oidcServerResponse{
			AuthEndpoint:       replaceBaseURL(oidcResponse.AuthEndpoint, *internalAuthURL, authURL),
			TokenEndpoint:      replaceBaseURL(oidcResponse.TokenEndpoint, *internalAuthURL, authURL),
			UserInfoEndpoint:   replaceBaseURL(oidcResponse.UserInfoEndpoint, *internalAuthURL, authURL),
			EndSessionEndpoint: replaceBaseURL(oidcResponse.EndSessionEndpoint, *internalAuthURL, authURL),
		}
		handler.oidcConfig = extConfig
	}

	return handler, nil
}

func replaceBaseURL(endpoint, oldBase, newBase string) string {
	oldURL, err := url.Parse(oldBase)
	if err != nil {
		return endpoint
	}
	newURL, err := url.Parse(newBase)
	if err != nil {
		return endpoint
	}
	endpointURL, err := url.Parse(endpoint)
	if err != nil {
		return endpoint
	}
	if endpointURL.Host == oldURL.Host {
		endpointURL.Scheme = newURL.Scheme
		endpointURL.Host = newURL.Host
	}
	return endpointURL.String()
}

func getOIDCClient(verifier *string, oidcConfig oidcServerResponse) (*osincli.Client, error) {
	oidcClientConfig := &osincli.ClientConfig{
		ClientId:                 config.AuthClientId,
		AuthorizeUrl:             oidcConfig.AuthEndpoint,
		TokenUrl:                 oidcConfig.TokenEndpoint,
		RedirectUrl:              config.BaseUiUrl + "/callback",
		ErrorsInStatusCode:       true,
		Scope:                    config.AuthScope,
		SendClientSecretInParams: true,
	}

	if verifier != nil {
		oidcClientConfig.CodeChallengeMethod = "S256"
		oidcClientConfig.CodeChallenge = oauth2.S256ChallengeFromVerifier(*verifier)
		oidcClientConfig.CodeVerifier = *verifier
	}

	client, err := osincli.NewClient(oidcClientConfig)
	if err != nil {
		return nil, err
	}
	return client, nil
}

func (a OIDCAuthHandler) GetToken(loginParams LoginParameters, r *http.Request) (TokenData, *int64, error) {
	cookie, err := r.Cookie(common.CookieSessionAuthName)
	if err != nil && !errors.Is(err, http.ErrNoCookie) {
		return TokenData{}, nil, err
	}
	var verifier string
	if cookie != nil {
		verifier = cookie.Value
	}
	client, err := getOIDCClient(&verifier, a.internalOidcConfig)
	if err != nil {
		return TokenData{}, nil, err
	}
	client.Transport = &OIDCRoundTripper{
		Origin: r.Header.Get("Origin"),
		Transport: &http.Transport{
			TLSClientConfig: a.tlsConfig,
		},
	}
	return exchangeToken(loginParams, client)
}

var subjectKeys = []string{"preferred_username", "nickname", "name", "email"}

func (o *OIDCAuthHandler) GetUserInfo(token string) (string, *http.Response, error) {
	jwtToken, err := jwt.Parse([]byte(token), jwt.WithVerify(false), jwt.WithValidate(false))
	if err != nil {
		return "", nil, err
	}

	for _, key := range subjectKeys {
		keyVal, found := jwtToken.Get(key)
		if found {
			if valStr, ok := keyVal.(string); ok {
				return valStr, nil, nil
			}

		}
	}

	return jwtToken.Subject(), nil, nil
}

func (o *OIDCAuthHandler) Logout(token string) (string, error) {
	u, err := url.Parse(o.oidcConfig.EndSessionEndpoint)
	if err != nil {
		log.GetLogger().WithError(err).Warn("Failed to parse OIDC response")
		return "", err
	}

	uq := u.Query()
	uq.Add("post_logout_redirect_uri", config.BaseUiUrl)
	uq.Add("client_id", config.AuthClientId)
	u.RawQuery = uq.Encode()
	return u.String(), nil
}

func (o OIDCAuthHandler) RefreshToken(refreshToken string, r *http.Request) (TokenData, *int64, error) {
	client, _ := getOIDCClient(nil, o.internalOidcConfig)
	return refreshOAuthToken(refreshToken, client)
}

func (a *OIDCAuthHandler) GetLoginRedirectURL() (string, string) {
	var verifier string
	if config.AuthForcePKCE == "true" || slices.Contains(a.oidcConfig.CodeChallengeMethod, "S256") {
		verifier = oauth2.GenerateVerifier()
	}
	client, _ := getOIDCClient(&verifier, a.oidcConfig)
	return loginRedirect(client), verifier
}
