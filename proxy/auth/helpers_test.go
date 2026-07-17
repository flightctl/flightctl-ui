package auth

import (
	"fmt"
	"net/http"
	"net/url"
	"os"
	"testing"

	"github.com/flightctl/flightctl-ui/log"
)

func TestMain(m *testing.M) {
	log.InitLogs()
	os.Exit(m.Run())
}

// redirectBaseMatchesRequest is a test helper that checks whether url u's origin
// matches the effective request origin. Returns nil when they match, error otherwise.
func redirectBaseMatchesRequest(t *testing.T, r *http.Request, u *url.URL) error {
	t.Helper()
	ok, err := isSameSchemeAndHost(u.String(), r)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("origin mismatch: redirect base %s://%s does not match request origin", u.Scheme, u.Host)
	}
	return nil
}
