package bridge

import (
	"fmt"
	"net/http"
	"net/url"
	"path"
	"strings"

	"github.com/flightctl/flightctl-ui/common"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
)

const appConsoleTypeSerial = "serial"

// allowedAppConsoleClientQueryParams are query keys the UI may send to the proxy.
// org_id and force are forwarded to remote-access when present.
var allowedAppConsoleClientQueryParams = map[string]struct{}{
	"org_id": {},
	"force":  {},
}

// parseAppConsoleClientQuery validates client query parameters against an allow-list
// and returns whether a forced session takeover was requested and the org ID, if any.
func parseAppConsoleClientQuery(rawQuery string) (force bool, orgID string, err error) {
	if rawQuery == "" {
		return false, "", nil
	}

	parsedQuery, err := url.ParseQuery(rawQuery)
	if err != nil {
		return false, "", fmt.Errorf("invalid query string: %w", err)
	}

	for key := range parsedQuery {
		if _, ok := allowedAppConsoleClientQueryParams[key]; !ok {
			return false, "", fmt.Errorf("unsupported query parameter: %q", key)
		}
	}

	orgValues, hasOrgID := parsedQuery["org_id"]
	if hasOrgID {
		if len(orgValues) != 1 || orgValues[0] == "" {
			return false, "", fmt.Errorf("invalid org_id parameter")
		}
		if _, err := uuid.Parse(orgValues[0]); err != nil {
			return false, "", fmt.Errorf("invalid org_id parameter")
		}
		orgID = orgValues[0]
	}

	forceValues, hasForce := parsedQuery["force"]
	if !hasForce {
		return false, orgID, nil
	}
	if len(forceValues) != 1 || forceValues[0] != "true" {
		return false, "", fmt.Errorf("invalid force parameter")
	}

	return true, orgID, nil
}

// buildAppConsoleURL constructs a websocket URL for an application serial console endpoint.
// Currently serial console is only supported for VM applications.
// consoleType is always set server-side; org_id and force may be forwarded from the client.
func buildAppConsoleURL(basePath string, force bool, orgID string) (string, error) {

	baseURL, err := url.Parse(config.FctlRemoteAccessUrl)
	if err != nil {
		return "", fmt.Errorf("invalid remote access URL: %w", err)
	}

	wsScheme := "wss"
	if strings.EqualFold(baseURL.Scheme, "http") {
		wsScheme = "ws"
	}

	consoleURL := &url.URL{
		Scheme: wsScheme,
		Host:   baseURL.Host,
		Path:   basePath,
	}
	query := url.Values{"consoleType": {appConsoleTypeSerial}}
	if orgID != "" {
		query.Set("org_id", orgID)
	}
	if force {
		query.Set("force", "true")
	}
	consoleURL.RawQuery = query.Encode()

	return consoleURL.String(), nil
}

func (t TerminalBridge) HandleAppTerminal(w http.ResponseWriter, r *http.Request) {
	if !isWebsocketUpgrade(r) {
		errMsg := "not a websocket connection"
		log.Warn(errMsg)
		w.WriteHeader(http.StatusInternalServerError)
		_, _ = w.Write([]byte(errMsg))
		return
	}

	vars := mux.Vars(r)
	deviceID := vars["deviceId"]
	appName := vars["appName"]

	if !common.IsSafeResourceName(deviceID) || !common.IsSafeResourceName(appName) {
		log.Warnf("Invalid app console request")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	force, orgID, err := parseAppConsoleClientQuery(r.URL.RawQuery)
	if err != nil {
		log.Warnf("Failed to parse app console query: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	basePath := path.Join("/ws/v1/devices", deviceID, "applications", appName, "console")
	consoleURL, err := buildAppConsoleURL(basePath, force, orgID)
	if err != nil {
		log.Warnf("Failed to build app console URL: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	log.Infof("Starting app console session for device: %s app: %s", deviceID, appName)
	t.bridgeWebSocket(w, r, consoleURL, fmt.Sprintf("device %s app %s", deviceID, appName))
}
