package config

import (
	"encoding/json"
	"net/http"
)

type OcpConfig struct {
	RBACNs         string `json:"rbacNs"`
	ExternalApiUrl string `json:"externalApiUrl"`
}

type OcpConfigHandler struct{}

func (c *OcpConfigHandler) GetConfig(w http.ResponseWriter, r *http.Request) {
	externalApiUrl := FctlApiUrlExternal
	if externalApiUrl == "" {
		externalApiUrl = FctlApiUrl
	}

	ocpConfig := OcpConfig{
		RBACNs:         RBACNs,
		ExternalApiUrl: externalApiUrl,
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
