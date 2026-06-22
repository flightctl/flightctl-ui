package auth

import (
	"fmt"
	"net/http"
	"net/url"
)

// redirectBaseMatchesRequest is a test helper that checks whether url u's origin
// matches the effective request origin. Returns nil when they match, error otherwise.
func redirectBaseMatchesRequest(r *http.Request, u *url.URL) error {
	ok, err := isSameSchemeAndHost(u.String(), r)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("origin mismatch: redirect base %q does not match request origin", u)
	}
	return nil
}
