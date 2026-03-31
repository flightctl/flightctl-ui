package auth

import (
	"crypto/tls"
	"net/http/httptest"
	"net/url"
	"testing"
)

func TestRedirectBaseMatchesRequest_NormalizesDefaultHTTPSPort(t *testing.T) {
	t.Parallel()

	r := httptest.NewRequest("GET", "https://ui.example.com/api/logout", nil)
	r.TLS = &tls.ConnectionState{}
	r.Host = "ui.example.com:443"

	u := &url.URL{Scheme: "https", Host: "ui.example.com"}
	if err := redirectBaseMatchesRequest(r, u); err != nil {
		t.Fatalf("expected origins to match after normalization, got error: %v", err)
	}
}

func TestRedirectBaseMatchesRequest_NormalizesDefaultHTTPPort(t *testing.T) {
	t.Parallel()

	r := httptest.NewRequest("GET", "http://ui.example.com/api/logout", nil)
	r.Host = "ui.example.com:80"

	u := &url.URL{Scheme: "http", Host: "ui.example.com"}
	if err := redirectBaseMatchesRequest(r, u); err != nil {
		t.Fatalf("expected origins to match after normalization, got error: %v", err)
	}
}

func TestRedirectBaseMatchesRequest_RejectsNonDefaultPortMismatch(t *testing.T) {
	t.Parallel()

	r := httptest.NewRequest("GET", "https://ui.example.com/api/logout", nil)
	r.TLS = &tls.ConnectionState{}
	r.Host = "ui.example.com:8443"

	u := &url.URL{Scheme: "https", Host: "ui.example.com"}
	if err := redirectBaseMatchesRequest(r, u); err == nil {
		t.Fatal("expected non-default port mismatch to be rejected")
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
