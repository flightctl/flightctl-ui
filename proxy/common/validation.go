package common

import (
	"fmt"
	"net/url"
	"path"
	"regexp"

	"github.com/flightctl/flightctl-ui/config"
)

// Regular expression to validate kubernetes resource names.
var resourceNameRegex = regexp.MustCompile(`^[a-zA-Z0-9]([a-zA-Z0-9._:-]*[a-zA-Z0-9])?$`)

// IsSafeResourceName validates that a resource name is safe to use in URL construction.
// This prevents SSRF attacks through path traversal or URL manipulation.
func IsSafeResourceName(resourceName string) bool {
	if resourceName == "" {
		return false
	}
	if len(resourceName) > 253 {
		return false
	}
	if !resourceNameRegex.MatchString(resourceName) {
		return false
	}
	return true
}

// BuildFctlApiUrl constructs a URL for the Flight Control API by safely joining path segments.
// This prevents SSRF attacks by using proper URL parsing and path joining instead of string concatenation.
func BuildFctlApiUrl(pathSegments ...string) (string, error) {
	baseURL, err := url.Parse(config.FctlApiUrl)
	if err != nil {
		return "", fmt.Errorf("invalid base API URL: %w", err)
	}
	baseURL.Path = path.Join(append([]string{baseURL.Path}, pathSegments...)...)
	return baseURL.String(), nil
}
