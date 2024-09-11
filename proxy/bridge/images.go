package bridge

import (
	"encoding/json"
	"net/http"

	"github.com/flightctl/flightctl-ui/config"
)

type DeviceImages struct {
	Bootc string `json:"bootc"`
	Qcow2 string `json:"qcow2"`
}

func HandleDeviceImages(w http.ResponseWriter, r *http.Request) {
	deviceImages := DeviceImages{
		Bootc: config.BootcImg,
		Qcow2: config.Qcow2Img,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(deviceImages)
}
