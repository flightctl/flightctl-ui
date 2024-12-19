package config

import (
	"encoding/json"
	"net/http"
)

type OcpConfig struct {
	RBACNs string `json:"rbacNs"`
}

type OcpConfigHandler struct{}

func (c *OcpConfigHandler) GetConfig(w http.ResponseWriter, r *http.Request) {
	ocpConfig := OcpConfig{
		RBACNs: RBACNs,
	}
	resp, err := json.Marshal(ocpConfig)
	if err != nil {
		http.Error(w, "Failed to marshal response", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if _, err := w.Write(resp); err != nil {
		http.Error(w, "Failed to write response", http.StatusInternalServerError)
		return
	}
}
