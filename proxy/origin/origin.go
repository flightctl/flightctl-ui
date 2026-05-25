package origin

import (
	"net"
	"net/http"
	"net/url"
	"strings"

	"github.com/flightctl/flightctl-ui/config"
)

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
