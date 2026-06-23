package auth

import (
	"testing"
)

func TestOpenShiftLogout(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		authURL string
		wantURL string
	}{
		{
			name:    "derives logout URL from auth URL",
			authURL: "https://oauth-openshift.apps.cluster.example.com/oauth/authorize",
			wantURL: "https://oauth-openshift.apps.cluster.example.com/logout",
		},
		{
			name:    "strips path and query",
			authURL: "https://oauth-openshift.apps.cluster.example.com/oauth/authorize?response_type=code",
			wantURL: "https://oauth-openshift.apps.cluster.example.com/logout",
		},
		{
			name:    "empty auth URL falls back",
			authURL: "",
			wantURL: "",
		},
		{
			name:    "invalid auth URL falls back",
			authURL: "://not-a-valid-url",
			wantURL: "",
		},
		{
			name:    "scheme-less auth URL falls back",
			authURL: "//oauth-openshift.apps.cluster.example.com/oauth/authorize",
			wantURL: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			handler := &OpenShiftAuthHandler{authURL: tt.authURL}
			got, err := handler.Logout("test-token", "https://ui.example.com")
			if err != nil {
				t.Fatalf("expected no error, got: %v", err)
			}
			if got != tt.wantURL {
				t.Fatalf("expected %q, got %q", tt.wantURL, got)
			}
		})
	}
}
