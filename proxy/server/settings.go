package server

import (
	"encoding/json"
	"net/http"

	"github.com/flightctl/flightctl-ui/config"
)

type uiSettings struct {
	IsRHEM bool `json:"isRHEM"`
}

func UISettingsHandler(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	settings := uiSettings{
		IsRHEM: config.IsRHEMEnabled(),
	}
	_ = json.NewEncoder(w).Encode(settings)
}
