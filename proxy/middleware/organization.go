package middleware

import (
	"net/http"
	"strings"
)

const (
	headerOrganizationID = "X-FlightCtl-Organization-ID"
	queryOrganizationID  = "org_id"
)

// OrganizationMiddleware adds org_id query parameter to FlightCtl API requests
// and blocks API calls when no organization is selected

func OrganizationMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Don't add org_id to requests that don't need it, and for CORS preflight requests
		if r.Method == http.MethodOptions || !shouldAddOrgID(r.URL.Path) {
			next.ServeHTTP(w, r)
			return
		}

		orgID := r.Header.Get(headerOrganizationID)

		if orgID == "" {
			// No organization selected - block this API call with 428 Precondition required
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusPreconditionRequired)
			w.Write([]byte(`{"error": "Organization selection required", "code": "ORGANIZATION_REQUIRED"}`))
			return
		}

		// Organization is selected - add org_id to the request
		query := r.URL.Query()
		query.Set(queryOrganizationID, orgID)
		r.URL.RawQuery = query.Encode()

		next.ServeHTTP(w, r)
	})
}

func isFlightCtlAPICall(path string) bool {
	return strings.Contains(path, "/api/v1/")
}

func shouldAddOrgID(path string) bool {
	excludePaths := []string{
		// The API call to retrieve all organizations (otherwise, if called with an org_id, only that particular organization will be returned
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
