package config

import (
	"net"
	"net/http/httptest"
	"testing"
)

func TestParseTrustedProxyCIDRs(t *testing.T) {
	t.Parallel()
	nets := parseTrustedProxyCIDRs("127.0.0.1/32, 10.0.0.0/8")
	if len(nets) != 2 {
		t.Fatalf("expected 2 nets, got %d", len(nets))
	}
	nets = parseTrustedProxyCIDRs("127.0.0.1")
	if len(nets) != 1 || !nets[0].Contains(net.ParseIP("127.0.0.1")) {
		t.Fatalf("expected single-host CIDR for 127.0.0.1")
	}
	if len(parseTrustedProxyCIDRs("not-a-cidr,,,garbage")) != 0 {
		t.Fatal("expected no nets from all-invalid CIDR string")
	}
}

func TestShouldTrustForwardedHeaders(t *testing.T) { //nolint:paralleltest // mutates package-level config
	oldTrust := TrustXForwardedHeaders
	oldNets := trustedProxyNets
	oldExplicit := trustedProxyCIDRSExplicit
	defer func() {
		TrustXForwardedHeaders = oldTrust
		trustedProxyNets = oldNets
		trustedProxyCIDRSExplicit = oldExplicit
	}()

	TrustXForwardedHeaders = false
	trustedProxyNets = nil
	req := httptest.NewRequest("GET", "/", nil)
	req.RemoteAddr = "127.0.0.1:12345"
	if ShouldTrustForwardedHeaders(req) {
		t.Fatal("expected false when TrustXForwardedHeaders is false")
	}

	TrustXForwardedHeaders = true
	trustedProxyNets = nil
	trustedProxyCIDRSExplicit = false
	if !ShouldTrustForwardedHeaders(req) {
		t.Fatal("expected true when trust is on and no CIDR restriction")
	}

	trustedProxyCIDRSExplicit = true
	trustedProxyNets = nil
	if ShouldTrustForwardedHeaders(req) {
		t.Fatal("expected false when TRUSTED_PROXY_CIDRS was set but no valid nets parsed (fail closed)")
	}

	trustedProxyCIDRSExplicit = false
	trustedProxyNets = parseTrustedProxyCIDRs("127.0.0.1/32")
	if !ShouldTrustForwardedHeaders(req) {
		t.Fatal("expected true when RemoteAddr is in CIDR")
	}
	req.RemoteAddr = "192.0.2.1:1"
	if ShouldTrustForwardedHeaders(req) {
		t.Fatal("expected false when RemoteAddr is outside CIDR")
	}
}
