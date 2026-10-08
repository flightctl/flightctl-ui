package auth

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"testing"

	"github.com/flightctl/flightctl-ui/log"
)

// TestMain initializes the shared logger the same way the proxy does at startup
// (see app.go), so that error-path logging inside the handlers under test does
// not dereference a nil logger.
func TestMain(m *testing.M) {
	log.InitLogs()
	os.Exit(m.Run())
}

// revokeRecorder captures the token-revocation request the AAP handler sends so
// tests can assert that the existing server-to-server revocation behavior is
// preserved alongside the new redirect behavior.
type revokeRecorder struct {
	called bool
	method string
	path   string
	form   url.Values
}

// newRevokeTestServer returns an httptest server that emulates AAP's OAuth token
// revocation endpoint and records the request it receives. The server is closed
// automatically when the test finishes.
func newRevokeTestServer(t *testing.T, status int) (*httptest.Server, *revokeRecorder) {
	t.Helper()
	rec := &revokeRecorder{}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rec.called = true
		rec.method = r.Method
		rec.path = r.URL.Path
		if err := r.ParseForm(); err != nil {
			http.Error(w, "failed to parse form: "+err.Error(), http.StatusBadRequest)
			return
		}
		rec.form = r.PostForm
		w.WriteHeader(status)
	}))
	t.Cleanup(srv.Close)
	return srv, rec
}

// TestAAPLogoutBuildsSessionTerminationURL verifies that after the OAuth token is
// revoked, Logout returns a redirect to AAP's session-termination endpoint
// ({internalAuthURL}/api/gateway/v1/logout/) carrying next={postLogoutBase}.
func TestAAPLogoutBuildsSessionTerminationURL(t *testing.T) {
	t.Parallel()

	srv, rec := newRevokeTestServer(t, http.StatusOK)

	handler := &AAPAuthHandler{
		internalAuthURL: srv.URL,
		clientId:        "test-client",
	}

	const postLogoutBase = "https://ui.example.com/ui"
	logoutURL, err := handler.Logout("the-token", postLogoutBase)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	expected := srv.URL + "/api/gateway/v1/logout/?next=" + url.QueryEscape(postLogoutBase)
	if logoutURL != expected {
		t.Fatalf("unexpected logout URL.\n  expected %q\n  got      %q", expected, logoutURL)
	}

	// Existing behavior must be preserved: the token is revoked server-to-server
	// against {internalAuthURL}/o/revoke_token/ before the redirect is returned.
	if !rec.called {
		t.Fatal("expected token revocation request to be sent")
	}
	if rec.method != http.MethodPost {
		t.Fatalf("expected revoke request method POST, got %q", rec.method)
	}
	if rec.path != "/o/revoke_token/" {
		t.Fatalf("expected revoke path /o/revoke_token/, got %q", rec.path)
	}
	if got := rec.form.Get("token"); got != "the-token" {
		t.Fatalf("expected revoke form token %q, got %q", "the-token", got)
	}
	if got := rec.form.Get("client_id"); got != "test-client" {
		t.Fatalf("expected revoke form client_id %q, got %q", "test-client", got)
	}
}

// TestAAPLogoutHandlesTrailingSlashInBaseURL verifies robust URL construction:
// a configured internalAuthURL with a trailing slash must not produce a double
// slash, and the trailing slash on /api/gateway/v1/logout/ must be preserved.
func TestAAPLogoutHandlesTrailingSlashInBaseURL(t *testing.T) {
	t.Parallel()

	srv, _ := newRevokeTestServer(t, http.StatusOK)

	handler := &AAPAuthHandler{
		internalAuthURL: srv.URL + "/", // configured value with a trailing slash
		clientId:        "test-client",
	}

	const postLogoutBase = "https://ui.example.com/ui"
	logoutURL, err := handler.Logout("the-token", postLogoutBase)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	expected := srv.URL + "/api/gateway/v1/logout/?next=" + url.QueryEscape(postLogoutBase)
	if logoutURL != expected {
		t.Fatalf("trailing slash in base URL not normalized.\n  expected %q\n  got      %q", expected, logoutURL)
	}
}

// TestAAPLogoutOnlyUsesConfiguredURLs is an open-redirect prevention test. Even
// when postLogoutBase points at a different host, the redirect target the browser
// is sent to must stay locked to the configured AAP origin (a.internalAuthURL);
// next must be exactly the configured base and must be the only query
// parameter.
func TestAAPLogoutOnlyUsesConfiguredURLs(t *testing.T) {
	t.Parallel()

	srv, _ := newRevokeTestServer(t, http.StatusOK)

	handler := &AAPAuthHandler{
		internalAuthURL: srv.URL,
		clientId:        "test-client",
	}

	// postLogoutBase is a *different* host than the AAP provider. If the redirect
	// target were ever taken from it, logout would become an open redirect.
	const postLogoutBase = "https://ui.example.com/ui"
	logoutURL, err := handler.Logout("the-token", postLogoutBase)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	got, err := url.Parse(logoutURL)
	if err != nil {
		t.Fatalf("returned logout URL is not parseable: %v", err)
	}
	configured, err := url.Parse(srv.URL)
	if err != nil {
		t.Fatalf("failed to parse configured internalAuthURL: %v", err)
	}

	// Redirect target scheme+host is derived only from a.internalAuthURL, never
	// from the (different-host) postLogoutBase.
	if got.Scheme != configured.Scheme || got.Host != configured.Host {
		t.Fatalf("redirect target must stay on the configured AAP origin %q, got scheme=%q host=%q",
			srv.URL, got.Scheme, got.Host)
	}
	if got.Path != "/api/gateway/v1/logout/" {
		t.Fatalf("expected session-termination path /api/gateway/v1/logout/, got %q", got.Path)
	}
	// next must equal the configured base exactly -- not modified or injected.
	if rt := got.Query().Get("next"); rt != postLogoutBase {
		t.Fatalf("expected next to equal the configured base %q, got %q", postLogoutBase, rt)
	}
	// The only query parameter is next; nothing else leaks into the target.
	if n := len(got.Query()); n != 1 {
		t.Fatalf("expected exactly one query parameter (next), got %d: %v", n, got.Query())
	}
}

// TestAAPLogoutReturnsErrorOnRevocationFailure verifies the existing behavior is
// preserved: if the token-revocation request fails, Logout returns the error and
// does not issue a redirect.
func TestAAPLogoutReturnsErrorOnRevocationFailure(t *testing.T) {
	t.Parallel()

	// Start a server, then close it so the revocation POST fails with a connection
	// error, exercising the "revocation failed" path deterministically.
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	revokeURL := srv.URL
	srv.Close()

	handler := &AAPAuthHandler{
		internalAuthURL: revokeURL,
		clientId:        "test-client",
	}

	logoutURL, err := handler.Logout("the-token", "https://ui.example.com/ui")
	if err == nil {
		t.Fatal("expected an error when token revocation fails, got nil")
	}
	if logoutURL != "" {
		t.Fatalf("expected empty logout URL on revocation failure, got %q", logoutURL)
	}
}

// TestAAPLogoutReturnsErrorOnNon2xxRevocation verifies that a non-2xx response
// from the revocation endpoint is treated as a failure: Logout returns an error
// and does not issue a session-termination redirect (the token may still be valid).
func TestAAPLogoutReturnsErrorOnNon2xxRevocation(t *testing.T) {
	t.Parallel()

	srv, _ := newRevokeTestServer(t, http.StatusInternalServerError)

	handler := &AAPAuthHandler{
		internalAuthURL: srv.URL,
		clientId:        "test-client",
	}

	logoutURL, err := handler.Logout("the-token", "https://ui.example.com/ui")
	if err == nil {
		t.Fatal("expected an error when revocation returns a non-2xx status, got nil")
	}
	if logoutURL != "" {
		t.Fatalf("expected empty logout URL on non-2xx revocation, got %q", logoutURL)
	}
}
