package origin

import (
	"net"
	"net/http"
	"net/url"
	"strings"

	"github.com/flightctl/flightctl-ui/config"
)

// openshiftConsoleProxyWebSocketOrigin is the Origin openshift/console sets on outbound
// WebSocket dials to plugin backends (see openshift/console pkg/proxy/proxy.go).
const openshiftConsoleProxyWebSocketOrigin = "http://localhost"

// IsOpenShiftConsoleProxyWebSocketOrigin reports whether origin is the console proxy's
// documented placeholder, not an arbitrary cross-site Origin.
func IsOpenShiftConsoleProxyWebSocketOrigin(origin string) bool {
	u, err := url.Parse(origin)
	if err != nil {
		return false
	}
	return Normalize(u.Scheme, u.Host) == openshiftConsoleProxyWebSocketOrigin
}

// EffectiveRequest returns the client-facing scheme and host for the request.
// When trusted X-Forwarded-* headers are present, they define the origin; otherwise r.Host is used.
func EffectiveRequest(r *http.Request) (scheme, host string) {
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

// EffectiveRequestOrigin returns the normalized client-facing origin (scheme://host[:port]).
func EffectiveRequestOrigin(r *http.Request) string {
	rs, rh := EffectiveRequest(r)
	return Normalize(rs, rh)
}

// FromURL returns Normalize for an http(s) URL scheme and host.
func FromURL(u *url.URL) string {
	if u == nil {
		return ""
	}
	return Normalize(u.Scheme, u.Host)
}

// DirectRequestOrigin returns the normalized origin for the direct connection (r.Host),
// without using X-Forwarded-* headers.
func DirectRequestOrigin(r *http.Request) string {
	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	return Normalize(scheme, r.Host)
}

// Normalize returns a canonical origin string for scheme and host (default ports omitted).
func Normalize(scheme, host string) string {
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
