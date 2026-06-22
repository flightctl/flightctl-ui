package auth

import (
	"testing"
)

func TestOpenShiftLogout_ReturnsLogoutURLDerivedFromAuthURL(t *testing.T) {
	t.Parallel()

	handler := &OpenShiftAuthHandler{
		authURL: "https://oauth-openshift.apps.cluster.example.com/oauth/authorize",
	}

	logoutURL, err := handler.Logout("test-token", "https://ui.example.com")
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	expected := "https://oauth-openshift.apps.cluster.example.com/logout"
	if logoutURL != expected {
		t.Fatalf("expected %q, got %q", expected, logoutURL)
	}
}

func TestOpenShiftLogout_StripsExistingPathAndQuery(t *testing.T) {
	t.Parallel()

	handler := &OpenShiftAuthHandler{
		authURL: "https://oauth-openshift.apps.cluster.example.com/oauth/authorize?response_type=code",
	}

	logoutURL, err := handler.Logout("test-token", "")
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	expected := "https://oauth-openshift.apps.cluster.example.com/logout"
	if logoutURL != expected {
		t.Fatalf("expected %q, got %q", expected, logoutURL)
	}
}

func TestOpenShiftLogout_FallsBackGracefullyWhenAuthURLIsEmpty(t *testing.T) {
	t.Parallel()

	handler := &OpenShiftAuthHandler{
		authURL: "",
	}

	logoutURL, err := handler.Logout("test-token", "https://ui.example.com")
	if err != nil {
		t.Fatalf("expected no error on empty authURL, got: %v", err)
	}
	if logoutURL != "" {
		t.Fatalf("expected empty logout URL when authURL is empty, got: %q", logoutURL)
	}
}

func TestOpenShiftLogout_FallsBackGracefullyWhenAuthURLIsInvalid(t *testing.T) {
	t.Parallel()

	handler := &OpenShiftAuthHandler{
		authURL: "://not-a-valid-url",
	}

	logoutURL, err := handler.Logout("test-token", "https://ui.example.com")
	if err != nil {
		t.Fatalf("expected no error on invalid authURL, got: %v", err)
	}
	if logoutURL != "" {
		t.Fatalf("expected empty logout URL for invalid authURL, got: %q", logoutURL)
	}
}
