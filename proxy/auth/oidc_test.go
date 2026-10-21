package auth

import (
	"testing"

	"github.com/flightctl/flightctl/api/core/v1beta1"
)

func TestOIDCLogoutWithoutEndSessionEndpoint(t *testing.T) {
	t.Parallel()

	handler := &OIDCAuthHandler{
		endSessionEndpoint: "",
		clientId:           "client-id",
	}

	logoutURL, err := handler.Logout("token", "https://ui.example.com/ui")
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if logoutURL != "" {
		t.Fatalf("expected empty logout URL when end_session_endpoint is missing, got: %q", logoutURL)
	}
}

func TestOIDCLogoutBuildsEndSessionURL(t *testing.T) {
	t.Parallel()

	handler := &OIDCAuthHandler{
		endSessionEndpoint: "https://issuer.example.com/logout",
		clientId:           "client-id",
	}

	logoutURL, err := handler.Logout("token", "https://ui.example.com/ui")
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	expected := "https://issuer.example.com/logout?client_id=client-id&post_logout_redirect_uri=https%3A%2F%2Fui.example.com%2Fui"
	if logoutURL != expected {
		t.Fatalf("unexpected logout URL. expected %q, got %q", expected, logoutURL)
	}
}

func TestNormalizeLoginPrompt(t *testing.T) {
	t.Parallel()

	empty := ""
	loginConsent := "login consent"
	spaced := "  login  consent "

	tests := []struct {
		name   string
		prompt *string
		want   string
	}{
		{
			name:   "When prompt is nil it should use the API default",
			prompt: nil,
			want:   v1beta1.DefaultAuthProviderPrompt,
		},
		{
			name:   "When prompt is empty it should omit the parameter",
			prompt: &empty,
			want:   "",
		},
		{
			name:   "When prompt is configured it should return the value as-is",
			prompt: &loginConsent,
			want:   "login consent",
		},
		{
			name:   "When prompt has extra spaces it should preserve them",
			prompt: &spaced,
			want:   "  login  consent ",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := normalizeLoginPrompt(tt.prompt)
			if got != tt.want {
				t.Errorf("normalizeLoginPrompt() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestFilterUnsupportedPrompt(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name      string
		resolved  string
		supported []string
		want      string
	}{
		{
			name:      "When resolved is empty it should stay empty",
			resolved:  "",
			supported: []string{"login"},
			want:      "",
		},
		{
			name:      "When discovery omits prompt_values_supported it should keep resolved",
			resolved:  "select_account",
			supported: nil,
			want:      "select_account",
		},
		{
			name:      "When prompt_values_supported is empty it should omit prompt",
			resolved:  "select_account",
			supported: []string{},
			want:      "",
		},
		{
			name:      "When all tokens are supported it should keep resolved",
			resolved:  "login consent",
			supported: []string{"login", "consent", "select_account"},
			want:      "login consent",
		},
		{
			name:      "When select_account is unsupported it should omit prompt",
			resolved:  "select_account",
			supported: []string{"login", "consent", "create"},
			want:      "",
		},
		{
			name:      "When any token is unsupported it should omit prompt",
			resolved:  "login select_account",
			supported: []string{"login", "consent"},
			want:      "",
		},
		{
			name:      "When resolved has extra spaces and tokens are supported it should preserve them",
			resolved:  "  login  consent ",
			supported: []string{"login", "consent"},
			want:      "  login  consent ",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := filterUnsupportedPrompt(tt.resolved, tt.supported)
			if got != tt.want {
				t.Errorf("filterUnsupportedPrompt() = %q, want %q", got, tt.want)
			}
		})
	}
}
