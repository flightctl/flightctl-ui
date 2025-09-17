package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/flightctl/flightctl-ui/log"
)

// OrganizationMiddleware adds org_id query parameter to FlightCtl API requests
// and blocks API calls when no organization is selected
// Note: This middleware is only loaded when organizations are enabled
func OrganizationMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Only process FlightCtl API calls that should have org_id
		if !shouldAddOrgId(r.URL.Path) {
			next.ServeHTTP(w, r)
			return
		}

		orgId, err := getOrganizationFromRequest(r)

		if err != nil || orgId == "" {
			// No organization selected - block this API call with 412 Precondition Failed
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusPreconditionFailed)
			w.Write([]byte(`{"error": "Organization selection required", "code": "ORGANIZATION_REQUIRED"}`))
			return
		}

		// Organization is selected - add org_id to the request
		query := r.URL.Query()
		query.Set("org_id", orgId)
		r.URL.RawQuery = query.Encode()

		next.ServeHTTP(w, r)
	})
}

// getOrganizationFromRequest extracts the organization ID from the request header
func getOrganizationFromRequest(r *http.Request) (string, error) {
	// Read organization from header (both OCP plugin and standalone now use headers)
	organizationID := r.Header.Get("X-FlightCtl-Organization-ID")

	if organizationID == "" {
		log.GetLogger().Info("DEBUG MIDDLEWARE: No organization header found")
		return "", fmt.Errorf("no organization header found")
	}

	log.GetLogger().Infof("DEBUG MIDDLEWARE: Organization from header: '%s'", organizationID)
	return organizationID, nil
}

func isFlightCtlAPICall(path string) bool {
	return strings.Contains(path, "/api/v1/")
}

func shouldAddOrgId(path string) bool {
	excludePaths := []string{
		// The API call to retrieve all organizations - with an org_id, only that particular organization will be returned
		"/api/v1/organizations",
		"/login",
		"/logout",
		"/config",
	}

	for _, excludePath := range excludePaths {
		if strings.Contains(path, excludePath) {
			return false
		}
	}

	// Only add org_id to FlightCtl API calls
	return isFlightCtlAPICall(path)
}
