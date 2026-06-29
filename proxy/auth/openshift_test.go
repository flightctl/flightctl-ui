package auth

import (
	"crypto/sha256"
	b64 "encoding/base64"
	"net/http"
	"net/http/httptest"
	"testing"
)

// TestOpenShiftTokenName verifies the OAuthAccessToken Kubernetes resource name
// derivation: sha256~-prefixed tokens are hashed; legacy tokens are used as-is.
func TestOpenShiftTokenName(t *testing.T) {
	t.Parallel()

	sha256Hash := func(s string) string {
		hash := sha256.Sum256([]byte(s))
		return "sha256~" + b64.RawURLEncoding.EncodeToString(hash[:])
	}

	tests := []struct {
		name     string
		token    string
		wantName string
	}{
		{
			name:     "sha256~ prefix token is hashed",
			token:    "sha256~testtoken",
			wantName: sha256Hash("sha256~testtoken"),
		},
		{
			name:     "legacy token used as-is",
			token:    "opaque-legacy-token",
			wantName: "opaque-legacy-token",
		},
		{
			name:     "empty token unchanged",
			token:    "",
			wantName: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := openShiftTokenName(tt.token)
			if got != tt.wantName {
				t.Fatalf("expected %q, got %q", tt.wantName, got)
			}
		})
	}
}

// TestOpenShiftAPIServerBase verifies that openShiftAPIServerBase normalises
// the base URL by stripping any path, query, and fragment components.
func TestOpenShiftAPIServerBase(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		rawURL  string
		wantURL string
	}{
		{
			name:    "plain base URL is unchanged",
			rawURL:  "https://api.cluster.example.com",
			wantURL: "https://api.cluster.example.com",
		},
		{
			name:    "trailing slash is removed",
			rawURL:  "https://api.cluster.example.com/",
			wantURL: "https://api.cluster.example.com",
		},
		{
			name:    "path is stripped",
			rawURL:  "https://api.cluster.example.com/oauth/authorize",
			wantURL: "https://api.cluster.example.com",
		},
		{
			name:    "query string is stripped",
			rawURL:  "https://api.cluster.example.com?foo=bar",
			wantURL: "https://api.cluster.example.com",
		},
		{
			name:    "fragment is stripped",
			rawURL:  "https://api.cluster.example.com#frag",
			wantURL: "https://api.cluster.example.com",
		},
		{
			name:    "path and query are both stripped",
			rawURL:  "https://oauth.example.com/oauth/authorize?response_type=code",
			wantURL: "https://oauth.example.com",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := openShiftAPIServerBase(tt.rawURL)
			if got != tt.wantURL {
				t.Fatalf("expected %q, got %q", tt.wantURL, got)
			}
		})
	}
}

// TestOpenShiftLogout verifies that Logout revokes the token server-side via the
// Kubernetes OAuthAccessToken API and always returns ("", nil) — never a redirect URL.
func TestOpenShiftLogout(t *testing.T) {
	t.Parallel()

	sha256Hash := func(s string) string {
		hash := sha256.Sum256([]byte(s))
		return "sha256~" + b64.RawURLEncoding.EncodeToString(hash[:])
	}

	tests := []struct {
		name           string
		token          string
		apiServerURL   string
		serverStatus   int
		wantDeletePath string // empty means no HTTP call expected
		wantAuthHeader string
	}{
		{
			name:           "revokes sha256~ token via Kubernetes API",
			token:          "sha256~testtoken",
			serverStatus:   http.StatusOK,
			wantDeletePath: "/apis/oauth.openshift.io/v1/oauthaccesstokens/" + sha256Hash("sha256~testtoken"),
			wantAuthHeader: "Bearer sha256~testtoken",
		},
		{
			name:           "revokes legacy token via Kubernetes API",
			token:          "legacy-opaque-token",
			serverStatus:   http.StatusOK,
			wantDeletePath: "/apis/oauth.openshift.io/v1/oauthaccesstokens/legacy-opaque-token",
			wantAuthHeader: "Bearer legacy-opaque-token",
		},
		{
			name:           "tolerates server error and still returns empty URL",
			token:          "sha256~sometoken",
			serverStatus:   http.StatusInternalServerError,
			wantDeletePath: "/apis/oauth.openshift.io/v1/oauthaccesstokens/" + sha256Hash("sha256~sometoken"),
			wantAuthHeader: "Bearer sha256~sometoken",
		},
		{
			name:         "empty token skips revocation",
			token:        "",
			serverStatus: http.StatusOK,
		},
		{
			name:         "empty apiServerURL skips revocation",
			token:        "sha256~testtoken",
			apiServerURL: "", // override: do not use server
			serverStatus: http.StatusOK,
		},
		{
			name:           "apiServerURL with path and query is normalised",
			token:          "legacy-token",
			serverStatus:   http.StatusOK,
			wantDeletePath: "/apis/oauth.openshift.io/v1/oauthaccesstokens/legacy-token",
			wantAuthHeader: "Bearer legacy-token",
			// apiServerURL is set by the test loop to server.URL + "/oauth/authorize?foo=bar"
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			var gotMethod, gotPath, gotAuth string
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				gotMethod = r.Method
				gotPath = r.URL.Path
				gotAuth = r.Header.Get("Authorization")
				w.WriteHeader(tt.serverStatus)
			}))
			defer server.Close()

			// Determine which apiServerURL to use
			apiServerURL := server.URL
			switch tt.name {
			case "empty apiServerURL skips revocation":
				apiServerURL = ""
			case "apiServerURL with path and query is normalised":
				apiServerURL = server.URL + "/oauth/authorize?foo=bar"
			}

			handler := &OpenShiftAuthHandler{apiServerURL: apiServerURL}
			gotURL, err := handler.Logout(tt.token, "https://ui.example.com")

			if err != nil {
				t.Fatalf("expected no error, got: %v", err)
			}
			if gotURL != "" {
				t.Fatalf("expected empty redirect URL, got %q", gotURL)
			}

			if tt.wantDeletePath == "" {
				// No HTTP call should have been made
				if gotMethod != "" {
					t.Fatalf("expected no HTTP call, but got %s %s", gotMethod, gotPath)
				}
				return
			}

			if gotMethod != http.MethodDelete {
				t.Fatalf("expected DELETE request, got %q", gotMethod)
			}
			if gotPath != tt.wantDeletePath {
				t.Fatalf("expected path %q, got %q", tt.wantDeletePath, gotPath)
			}
			if gotAuth != tt.wantAuthHeader {
				t.Fatalf("expected Authorization %q, got %q", tt.wantAuthHeader, gotAuth)
			}
		})
	}
}
