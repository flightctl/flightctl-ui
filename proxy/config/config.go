package config

import (
	"log"
	"net"
	"net/http"
	"os"
	"strings"
)

var (
	BridgePort             = ":" + getEnvVar("API_PORT", "3001")
	FctlApiUrl             = getEnvUrlVar("FLIGHTCTL_SERVER", "https://localhost:3443")
	FctlApiExternalUrl     = getEnvUrlVar("FLIGHTCTL_SERVER_EXTERNAL", "https://localhost:3443")
	FctlImageBuilderApiUrl = getEnvUrlVar("FLIGHTCTL_IMAGEBUILDER_SERVER", "https://localhost:8445")
	FctlApiInsecure        = getEnvVar("FLIGHTCTL_SERVER_INSECURE_SKIP_VERIFY", "false")
	FctlCliArtifactsUrl    = getEnvUrlVar("FLIGHTCTL_CLI_ARTIFACTS_SERVER", "http://localhost:8090")
	AlertManagerApiUrl     = getEnvUrlVar("FLIGHTCTL_ALERTMANAGER_PROXY", "https://localhost:8443")
	TlsKeyPath             = getEnvVar("TLS_KEY", "")
	TlsCertPath            = getEnvVar("TLS_CERT", "")
	BaseUiUrl              = getEnvUrlVar("BASE_UI_URL", "http://localhost:9000")
	AuthInsecure           = getEnvVar("AUTH_INSECURE_SKIP_VERIFY", "")
	OcpPlugin              = getEnvVar("IS_OCP_PLUGIN", "false")
	IsRHEM                 = getEnvVar("IS_RHEM", "")
	// TrustXForwardedHeaders enables use of X-Forwarded-Proto and X-Forwarded-Host for request
	// origin (e.g. TLS termination at an ingress). When false, only r.TLS and r.Host are used.
	// Set to true when a trusted reverse proxy sets these headers; see also TrustedProxyNets.
	TrustXForwardedHeaders = parseBoolEnv("TRUST_X_FORWARDED_HEADERS", false)
)

// trustedProxyNets is parsed from TRUSTED_PROXY_CIDRS (comma-separated). When non-empty and
// TrustXForwardedHeaders is true, forwarded headers apply only when the immediate client IP
// (r.RemoteAddr) falls within one of these networks.
// trustedProxyCIDRSExplicit is true when TRUSTED_PROXY_CIDRS is set to a non-empty value.
// If explicit but parsing yields no valid networks (malformed entries), we fail closed: never
// trust forwarded headers. When TRUSTED_PROXY_CIDRS is unset or empty, trustedProxyNets may be
// empty and all clients are accepted once TrustXForwardedHeaders is true (use only if the proxy
// is not reachable from untrusted clients).
var (
	trustedProxyNets          []*net.IPNet
	trustedProxyCIDRSExplicit bool
)

func init() {
	raw, ok := os.LookupEnv("TRUSTED_PROXY_CIDRS")
	raw = strings.TrimSpace(raw)
	trustedProxyCIDRSExplicit = ok && raw != ""
	trustedProxyNets = parseTrustedProxyCIDRs(raw)
	if trustedProxyCIDRSExplicit && len(trustedProxyNets) == 0 {
		log.Printf("config: TRUSTED_PROXY_CIDRS is set but no valid CIDRs were parsed; X-Forwarded-* headers will not be trusted")
	}
}

func parseBoolEnv(key string, defaultVal bool) bool {
	s, ok := os.LookupEnv(key)
	if !ok || strings.TrimSpace(s) == "" {
		return defaultVal
	}
	s = strings.TrimSpace(s)
	switch strings.ToLower(s) {
	case "1", "true", "t", "yes", "y", "on":
		return true
	case "0", "false", "f", "no", "n", "off":
		return false
	default:
		return defaultVal
	}
}

func parseTrustedProxyCIDRs(s string) []*net.IPNet {
	var out []*net.IPNet
	for _, part := range strings.Split(s, ",") {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		_, ipnet, err := net.ParseCIDR(part)
		if err != nil {
			// Single IP without mask: treat as /32 or /128
			if ip := net.ParseIP(part); ip != nil {
				suffix := "/128"
				if ip.To4() != nil {
					suffix = "/32"
				}
				_, ipnet, err = net.ParseCIDR(ip.String() + suffix)
				if err != nil {
					continue
				}
				out = append(out, ipnet)
			}
			continue
		}
		out = append(out, ipnet)
	}
	return out
}

// ShouldTrustForwardedHeaders reports whether X-Forwarded-Proto / X-Forwarded-Host may be used
// for this request. When false, callers must use only the direct connection (r.TLS, r.Host).
func ShouldTrustForwardedHeaders(r *http.Request) bool {
	if !TrustXForwardedHeaders {
		return false
	}
	// Fail closed: typo or malformed TRUSTED_PROXY_CIDRS must not fall through to "trust everyone".
	if trustedProxyCIDRSExplicit && len(trustedProxyNets) == 0 {
		return false
	}
	if len(trustedProxyNets) == 0 {
		return true
	}
	ip := remoteAddrIP(r)
	if ip == nil {
		return false
	}
	for _, n := range trustedProxyNets {
		if n.Contains(ip) {
			return true
		}
	}
	return false
}

func remoteAddrIP(r *http.Request) net.IP {
	if r == nil {
		return nil
	}
	addr := r.RemoteAddr
	host, _, err := net.SplitHostPort(addr)
	if err != nil {
		return net.ParseIP(addr)
	}
	return net.ParseIP(host)
}

func getEnvUrlVar(key string, defaultValue string) string {
	urlValue := getEnvVar(key, defaultValue)
	return strings.TrimSuffix(urlValue, "/")
}

func getEnvVar(key string, defaultValue string) string {
	val, ok := os.LookupEnv(key)
	if !ok {
		return defaultValue
	}
	return val
}
