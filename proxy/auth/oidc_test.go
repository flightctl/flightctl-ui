package auth

import "testing"

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
