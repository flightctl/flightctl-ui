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

		query := r.URL.Query()

		if isAlertsAPICall(r.URL.Path) {
			// AlertManager expects org_id as a filter parameter
			query.Set("filter", "org_id="+orgID)
		} else {
			query.Set(queryOrganizationID, orgID)
		}

		r.URL.RawQuery = query.Encode()

		// Remove the organization header since we've converted it to query param
		r.Header.Del(headerOrganizationID)

		next.ServeHTTP(w, r)
	})
}

func isFlightCtlAPICall(path string) bool {
	return strings.HasPrefix(path, "/api/flightctl/")
}

func isAlertsAPICall(path string) bool {
	return strings.HasPrefix(path, "/api/alerts/")
}

func shouldAddOrgID(path string) bool {
	// Exclude the organizations endpoint since it needs to return ALL organizations the user has access to
	if strings.HasPrefix(path, "/api/flightctl/api/v1/organizations") {
		return false
	}

	return isFlightCtlAPICall(path) || isAlertsAPICall(path)
}
