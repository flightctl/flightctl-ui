package bridge

import (
	"encoding/json"
	"net/http"

	"github.com/flightctl/flightctl-ui/utils"
)

type DeviceImages struct {
	Bootc string `json:"bootc"`
	Qcow2 string `json:"qcow2"`
}

func HandleDeviceImages(w http.ResponseWriter, r *http.Request) {
	deviceImages := DeviceImages{
		Bootc: utils.GetEnvVar("BOOTC_IMG_URL", ""),
		Qcow2: utils.GetEnvVar("QCOW2_IMG_URL", ""),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(deviceImages)
}
