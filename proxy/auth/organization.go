package auth

import (
	"encoding/json"
	"net/http"

	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
)

type OrganizationHandler struct {
	tlsConfig *http.Client
	authURL   string
}

type OrganizationSelection struct {
	OrganizationID string `json:"organizationId"`
}

func NewOrganizationHandler() (*OrganizationHandler, error) {
	client := &http.Client{}

	return &OrganizationHandler{
		tlsConfig: client,
		authURL:   config.FctlApiUrl,
	}, nil
}

// ServeHTTP handles both GET and POST requests for organization selection
func (o *OrganizationHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		o.getCurrentOrganization(w, r)
	case http.MethodPost:
		o.setOrganization(w, r)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (o *OrganizationHandler) setOrganization(w http.ResponseWriter, r *http.Request) {
	var orgSelection OrganizationSelection
	if err := json.NewDecoder(r.Body).Decode(&orgSelection); err != nil {
		log.GetLogger().WithError(err).Error("Failed to decode organization selection")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if orgSelection.OrganizationID == "" {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error": "organizationId is required"}`))
		return
	}

	// Store organization in session cookie
	if err := setOrganizationCookie(w, orgSelection.OrganizationID); err != nil {
		log.GetLogger().WithError(err).Error("Failed to set organization cookie")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status":         "success",
		"organizationId": orgSelection.OrganizationID,
	})
}

func (o *OrganizationHandler) getCurrentOrganization(w http.ResponseWriter, r *http.Request) {
	// Read the organization cookie
	cookie, err := r.Cookie("flightctl-organization")
	if err != nil {
		if err == http.ErrNoCookie {
			// No organization selected yet
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"organizationId": nil,
				"selected":       false,
			})
			return
		}
		log.GetLogger().WithError(err).Error("Failed to read organization cookie")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Return the selected organization
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"organizationId": cookie.Value,
		"selected":       true,
	})
}

func setOrganizationCookie(w http.ResponseWriter, organizationID string) error {
	cookie := &http.Cookie{
		Name:     "flightctl-organization",
		Value:    organizationID,
		Path:     "/",
		MaxAge:   8 * 60 * 60, // 8 hours
		HttpOnly: true,
		Secure:   config.TlsCertPath != "", // Only secure if HTTPS
		SameSite: http.SameSiteStrictMode,
	}
	http.SetCookie(w, cookie)
	return nil
}
