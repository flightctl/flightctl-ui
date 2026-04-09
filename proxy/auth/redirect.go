package auth

import (
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strings"

	"github.com/flightctl/flightctl-ui/config"
)

const oauthRedirectURICookiePrefix = "oauth_redirect_uri_"

// oauthCallbackURL builds the OAuth redirect_uri (…/callback) for the given UI origin scheme and host.
// The path prefix comes from config.BaseUiUrl so deployments served from a subpath (e.g. https://host/ui)
// resolve to …/ui/callback instead of …/callback.
func oauthCallbackURL(scheme, host string) (string, error) {
	scheme = strings.ToLower(strings.TrimSpace(scheme))
	if scheme != "http" && scheme != "https" {
		return "", fmt.Errorf("invalid origin scheme")
	}
	host = strings.TrimSpace(host)
	if host == "" || strings.ContainsAny(host, "@\r\n\t") {
		return "", fmt.Errorf("invalid origin host")
	}
	baseUI, err := url.Parse(config.BaseUiUrl)
	if err != nil {
		return "", fmt.Errorf("invalid BASE_UI_URL configuration: %w", err)
	}
	basePath := strings.TrimSuffix(baseUI.Path, "/")
	callbackPath := "/callback"
	if basePath != "" {
		callbackPath = basePath + "/callback"
	}

	pathURL := &url.URL{Path: callbackPath}
	return scheme + "://" + host + pathURL.EscapedPath(), nil
}

// ResolveOAuthRedirectURI returns the OAuth redirect_uri (callback URL) for this login attempt.
// If redirectBase is empty, it uses BASE_UI_URL from configuration (legacy behavior).
// If redirectBase is set, its origin (scheme://host[:port]) must match the incoming request
// (Host and, when trusted, X-Forwarded-* — see config.ShouldTrustForwardedHeaders), so clients
// cannot force arbitrary hosts. Any path on redirectBase is
// ignored for the resolved URI; the UI base path is taken from BASE_UI_URL (same as when
// redirectBase is empty), so e.g. BASE_UI_URL=https://host/ui still yields …/ui/callback.
func ResolveOAuthRedirectURI(r *http.Request, redirectBase string) (string, error) {
	if strings.TrimSpace(redirectBase) == "" {
		baseUI, err := url.Parse(config.BaseUiUrl)
		if err != nil {
			return "", fmt.Errorf("invalid BASE_UI_URL configuration: %w", err)
		}
		return oauthCallbackURL(baseUI.Scheme, baseUI.Host)
	}
	ok, err := isSameSchemeAndHost(redirectBase, r)
	if err != nil {
		return "", err
	}
	if !ok {
		return "", fmt.Errorf("redirect_base does not match this UI origin")
	}
	rs, rh := requestSchemeAndHost(r)
	canon := normalizeOrigin(rs, rh)
	scheme, host, err := splitCanonicalOriginURL(canon)
	if err != nil {
		return "", err
	}
	return oauthCallbackURL(scheme, host)
}

// ResolveLogoutRedirectBase returns the UI base URL for OIDC post_logout_redirect_uri (no trailing slash).
// It uses the same origin and BASE_UI_URL path rules as ResolveOAuthRedirectURI (e.g. https://host/ui
// when the UI is deployed under /ui).
// redirect_base follows the same rules as for login (see ResolveOAuthRedirectURI).
func ResolveLogoutRedirectBase(r *http.Request, redirectBase string) (string, error) {
	callbackURI, err := ResolveOAuthRedirectURI(r, redirectBase)
	if err != nil {
		return "", err
	}
	return strings.TrimSuffix(callbackURI, "/callback"), nil
}

// splitCanonicalOriginURL splits a string produced only by normalizeOrigin ("scheme://host[:port]").
func splitCanonicalOriginURL(canon string) (scheme, host string, err error) {
	const sep = "://"
	i := strings.Index(canon, sep)
	if i < 0 {
		return "", "", fmt.Errorf("invalid canonical origin")
	}
	scheme = canon[:i]
	host = canon[i+len(sep):]
	if scheme != "http" && scheme != "https" {
		return "", "", fmt.Errorf("invalid canonical origin scheme")
	}
	if host == "" {
		return "", "", fmt.Errorf("invalid canonical origin host")
	}
	return scheme, host, nil
}

func requestSchemeAndHost(r *http.Request) (scheme, host string) {
	scheme = "http"
	if r.TLS != nil {
		scheme = "https"
	}
	host = r.Host
	if !config.ShouldTrustForwardedHeaders(r) {
		return scheme, host
	}
	if p := r.Header.Get("X-Forwarded-Proto"); p != "" {
		scheme = strings.TrimSpace(strings.Split(p, ",")[0])
	}
	if xfh := r.Header.Get("X-Forwarded-Host"); xfh != "" {
		host = strings.TrimSpace(strings.Split(xfh, ",")[0])
	}
	return scheme, host
}

// isSameSchemeAndHost parses redirectBase as an http(s) URL, validates it, and reports whether
// its origin matches the effective request (see requestSchemeAndHost). Empty redirectBase
// returns (false, nil). Invalid redirect_base returns (_, err).
func isSameSchemeAndHost(redirectBase string, r *http.Request) (bool, error) {
	s := strings.TrimSpace(redirectBase)
	if s == "" {
		return false, nil
	}
	u, err := url.Parse(s)
	if err != nil {
		return false, fmt.Errorf("invalid redirect_base")
	}
	if u.Scheme != "http" && u.Scheme != "https" {
		return false, fmt.Errorf("invalid redirect_base: only http and https are allowed")
	}
	if u.Hostname() == "" {
		return false, fmt.Errorf("invalid redirect_base: host is required")
	}
	if u.RawQuery != "" || u.Fragment != "" {
		return false, fmt.Errorf("invalid redirect_base: query and fragment are not allowed")
	}
	if u.User != nil {
		return false, fmt.Errorf("invalid redirect_base: user info is not allowed")
	}
	rs, rh := requestSchemeAndHost(r)
	if normalizeOrigin(u.Scheme, u.Host) != normalizeOrigin(rs, rh) {
		return false, nil
	}
	return true, nil
}

// cookieSecureForRequest is true when the Set-Cookie Secure attribute should be set: TLS is
// configured on this proxy, or the effective request scheme is HTTPS (including when TLS
// terminates at a reverse proxy and X-Forwarded-Proto is trusted).
func cookieSecureForRequest(r *http.Request) bool {
	if config.TlsCertPath != "" {
		return true
	}
	if r == nil {
		return false
	}
	scheme, _ := requestSchemeAndHost(r)
	return strings.EqualFold(strings.TrimSpace(scheme), "https")
}

func normalizeOrigin(scheme, host string) string {
	scheme = strings.ToLower(strings.TrimSpace(scheme))
	host = strings.ToLower(strings.TrimSpace(host))

	hostname, port := splitHostAndPort(host)
	hostname = formatHostname(hostname)

	if (scheme == "http" && port == "80") || (scheme == "https" && port == "443") {
		port = ""
	}

	if port == "" {
		return scheme + "://" + hostname
	}
	return scheme + "://" + net.JoinHostPort(strings.Trim(hostname, "[]"), port)
}

func splitHostAndPort(host string) (hostname, port string) {
	if host == "" {
		return "", ""
	}
	if h, p, err := net.SplitHostPort(host); err == nil {
		return h, p
	}
	// Bracketed IPv6 without an explicit port.
	if strings.HasPrefix(host, "[") && strings.HasSuffix(host, "]") {
		return strings.Trim(host, "[]"), ""
	}
	return host, ""
}

func formatHostname(hostname string) string {
	hostname = strings.Trim(hostname, "[]")
	if strings.Contains(hostname, ":") {
		return "[" + hostname + "]"
	}
	return hostname
}

func setOAuthRedirectURICookie(w http.ResponseWriter, r *http.Request, state, redirectURI string) {
	cookieName := oauthRedirectURICookiePrefix + state
	cookie := http.Cookie{
		Name:     cookieName,
		Value:    redirectURI,
		Secure:   cookieSecureForRequest(r),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		MaxAge:   600,
	}
	http.SetCookie(w, &cookie)
}

func getOAuthRedirectURICookie(r *http.Request, state string) (string, error) {
	cookieName := oauthRedirectURICookiePrefix + state
	cookie, err := r.Cookie(cookieName)
	if err != nil {
		if errors.Is(err, http.ErrNoCookie) {
			return "", nil
		}
		return "", err
	}
	return cookie.Value, nil
}

func clearOAuthRedirectURICookie(w http.ResponseWriter, r *http.Request, state string) {
	cookieName := oauthRedirectURICookiePrefix + state
	cookie := http.Cookie{
		Name:     cookieName,
		Value:    "",
		MaxAge:   -1,
		Path:     "/",
		Secure:   cookieSecureForRequest(r),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, &cookie)
}
