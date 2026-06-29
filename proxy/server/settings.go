package server

import (
	"encoding/json"
	"net/http"

	"github.com/flightctl/flightctl-ui/config"
)

type uiSettings struct {
	IsRHEM bool `json:"isRHEM"`
}

// UISettingsHandler serves the UI configuration settings as JSON.
// It returns the current RHEM mode status and other UI-specific flags.
func UISettingsHandler(w http.ResponseWriter, _ *http.Request) {
	settings := uiSettings{
		IsRHEM: config.IsRHEM,
	}
	payload, err := json.Marshal(settings)
	if err != nil {
		http.Error(w, "Failed to encode settings", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if _, err := w.Write(payload); err != nil {
		return
	}
}
