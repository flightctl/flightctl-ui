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
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Write(resp)
}
