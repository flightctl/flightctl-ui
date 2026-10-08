package auth

import (
	"testing"
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

func TestPromptValue(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name                  string
		promptValuesSupported []string
		want                  string
	}{
		{
			name:                  "absent (nil) keeps select_account default",
			promptValuesSupported: nil,
			want:                  "select_account",
		},
		{
			name:                  "empty slice omits prompt",
			promptValuesSupported: []string{},
			want:                  "",
		},
		{
			name:                  "contains select_account returns select_account",
			promptValuesSupported: []string{"login", "consent", "select_account"},
			want:                  "select_account",
		},
		{
			name:                  "contains login but not select_account omits prompt",
			promptValuesSupported: []string{"login", "consent", "create"},
			want:                  "",
		},
		{
			name:                  "contains neither select_account nor login returns empty",
			promptValuesSupported: []string{"consent", "create"},
			want:                  "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			handler := &OIDCAuthHandler{
				promptValuesSupported: tt.promptValuesSupported,
			}
			got := handler.promptValue()
			if got != tt.want {
				t.Errorf("promptValue() = %q, want %q", got, tt.want)
			}
		})
	}
}
