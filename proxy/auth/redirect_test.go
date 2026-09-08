package auth

import (
	"crypto/tls"
	"net/http/httptest"
	"testing"
)

func TestIsSameSchemeAndHost_NormalizesDefaultHTTPSPort(t *testing.T) {
	t.Parallel()

	r := httptest.NewRequest("GET", "https://ui.example.com/api/logout", nil)
	r.TLS = &tls.ConnectionState{}
	r.Host = "ui.example.com:443"

	ok, err := isSameSchemeAndHost("https://ui.example.com", r)
	if err != nil || !ok {
		t.Fatalf("expected origins to match after normalization, got ok=%v err=%v", ok, err)
	}
}

func TestIsSameSchemeAndHost_NormalizesDefaultHTTPPort(t *testing.T) {
	t.Parallel()

	r := httptest.NewRequest("GET", "http://ui.example.com/api/logout", nil)
	r.Host = "ui.example.com:80"

	ok, err := isSameSchemeAndHost("http://ui.example.com", r)
	if err != nil || !ok {
		t.Fatalf("expected origins to match after normalization, got ok=%v err=%v", ok, err)
	}
}

func TestIsSameSchemeAndHost_RejectsNonDefaultPortMismatch(t *testing.T) {
	t.Parallel()

	r := httptest.NewRequest("GET", "https://ui.example.com/api/logout", nil)
	r.TLS = &tls.ConnectionState{}
	r.Host = "ui.example.com:8443"

	ok, err := isSameSchemeAndHost("https://ui.example.com", r)
	if err != nil || ok {
		t.Fatalf("expected non-default port mismatch to be rejected, got ok=%v err=%v", ok, err)
	}
}

func TestCookieSecureForRequest_DirectHTTPSTLS(t *testing.T) {
	t.Parallel()
	r := httptest.NewRequest("GET", "https://ui.example.com/api/login", nil)
	r.TLS = &tls.ConnectionState{}
	if !cookieSecureForRequest(r) {
		t.Fatal("expected Secure when request has TLS")
	}
}

func TestCookieSecureForRequest_DirectHTTP(t *testing.T) {
	t.Parallel()
	r := httptest.NewRequest("GET", "http://ui.example.com/api/login", nil)
	if cookieSecureForRequest(r) {
		t.Fatal("expected not Secure for plain HTTP without forwarded proto")
	}
}
