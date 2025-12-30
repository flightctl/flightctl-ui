package bridge

import (
	"crypto/tls"
	"fmt"
	"net/http"
	"net/textproto"
	"net/url"
	"path"
	"slices"
	"strings"
	"sync"
	"time"

	"github.com/flightctl/flightctl-ui/common"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/gorilla/websocket"
	log "github.com/sirupsen/logrus"
)

var (
	websocketPingInterval = 30 * time.Second
	websocketTimeout      = 30 * time.Second
	websocketHeaders      = []string{
		textproto.CanonicalMIMEHeaderKey("Connection"),
		textproto.CanonicalMIMEHeaderKey("Sec-Websocket-Extensions"),
		textproto.CanonicalMIMEHeaderKey("Sec-Websocket-Key"),
		textproto.CanonicalMIMEHeaderKey("Sec-Websocket-Version"),
		textproto.CanonicalMIMEHeaderKey("Upgrade"),
	}
)

type TerminalBridge struct {
	TlsConfig *tls.Config
}

func copyMsgs(writeMutex *sync.Mutex, dest, src *websocket.Conn) error {
	for {
		messageType, msg, err := src.ReadMessage()
		if err != nil {
			return err
		}

		if writeMutex == nil {
			err = dest.WriteMessage(messageType, msg)
		} else {
			writeMutex.Lock()
			err = dest.WriteMessage(messageType, msg)
			writeMutex.Unlock()
		}

		if err != nil {
			return err
		}
	}
}

// buildDeviceConsoleURL constructs a websocket URL for the device console endpoint.
// It extracts and validates the deviceId from the request path, sanitizes the query string,
// and safely builds the URL using Go's url package to prevent SSRF attacks.
func buildDeviceConsoleURL(r *http.Request) (string, error) {
	deviceId, found := strings.CutPrefix(r.URL.Path, "/api/terminal/")
	if !found || !common.IsSafeResourceName(deviceId) {
		return "", fmt.Errorf("invalid deviceId")
	}

	// Sanitize query string
	sanitizedQuery, err := sanitizeQueryForSSRF(r.URL.RawQuery)
	if err != nil {
		return "", fmt.Errorf("invalid query string: %w", err)
	}

	// Parse the base API URL to safely construct the websocket URL
	baseURL, err := url.Parse(config.FctlApiUrl)
	if err != nil {
		return "", fmt.Errorf("invalid base API URL: %w", err)
	}

	// Construct the websocket URL safely using url.URL to prevent SSRF
	consoleURL := &url.URL{
		Scheme: "wss",
		Host:   baseURL.Host,
		Path:   path.Join("/ws/v1/devices", deviceId, "console"),
	}

	// Add query parameters if present
	if sanitizedQuery != "" {
		parsedQuery, err := url.ParseQuery(sanitizedQuery)
		if err != nil {
			return "", fmt.Errorf("invalid sanitized query string: %w", err)
		}
		consoleURL.RawQuery = parsedQuery.Encode()
	}

	return consoleURL.String(), nil
}

// checkOrigin validates the Origin header against allowed origins.
// It allows:
//   - Requests from the configured BaseUiUrl origin
//   - Same-origin requests (Origin matches request Host)
//   - Requests without an Origin header (same-origin from browsers)
//
// Host comparisons are case-insensitive per RFC 3986.
func checkOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")

	// If no Origin header is present, allow the request (same-origin from browsers).
	if origin == "" {
		return true
	}

	originURL, err := url.Parse(origin)
	if err != nil {
		// Log rejected origin safely using %q to escape user-controlled input and prevent log injection
		log.Warnf("Rejected WebSocket connection - invalid Origin header: %q", origin)
		return false
	}

	baseURL, err := url.Parse(config.BaseUiUrl)
	if err != nil {
		log.WithError(err).Warnf("Failed to parse BaseUiUrl for origin check")
	} else if originURL.Scheme == baseURL.Scheme && strings.EqualFold(originURL.Host, baseURL.Host) {
		return true
	}

	// Allow same-origin requests
	if strings.EqualFold(originURL.Host, r.Host) {
		return true
	}

	// Log rejected origin safely using %q to escape user-controlled input and prevent log injection
	log.Warnf("Rejected WebSocket connection - unauthorized Origin header: %q", origin)
	return false
}

func (t TerminalBridge) HandleTerminal(w http.ResponseWriter, r *http.Request) {
	isWebsocket := false
	upgrades := r.Header["Upgrade"]

	for _, upgrade := range upgrades {
		if strings.ToLower(upgrade) == "websocket" {
			isWebsocket = true
			break
		}
	}

	if !isWebsocket {
		errMsg := "not a websocket connection"
		log.Warn(errMsg)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(errMsg))
	}

	consoleURL, err := buildDeviceConsoleURL(r)
	if err != nil {
		log.Warnf("Failed to build console URL: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Extract deviceId for logging purposes
	deviceId, _ := strings.CutPrefix(r.URL.Path, "/api/terminal/")
	log.Infof("Starting terminal session for device: %s", deviceId)

	dialer := &websocket.Dialer{
		TLSClientConfig: t.TlsConfig,
	}

	headers := http.Header{}
	for key := range r.Header {
		if !slices.Contains(websocketHeaders, textproto.CanonicalMIMEHeaderKey(key)) {
			headers.Add(key, r.Header.Get(key))
		}
	}

	backend, resp, err := dialer.Dial(consoleURL, headers)
	if err != nil {
		errMsg := fmt.Sprintf("Failed to dial backend: '%v'", err)
		statusCode := http.StatusBadGateway
		if resp == nil || resp.StatusCode == 0 {
			log.Warn(errMsg)
		} else {
			statusCode = resp.StatusCode
			if resp.Request == nil {
				log.Warnf("%s Status: '%v' (no request object)", errMsg, resp.Status)
			} else {
				log.Warnf("%s Status: '%v' URL: '%v'", errMsg, resp.Status, resp.Request.URL)
			}
		}
		http.Error(w, errMsg, statusCode)
		return
	}
	defer backend.Close()

	upgrader := &websocket.Upgrader{
		Subprotocols: websocket.Subprotocols(r),
		CheckOrigin:  checkOrigin,
	}

	frontend, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Warnf("Failed to upgrade websocket to client: '%v'", err)
		return
	}

	ticker := time.NewTicker(websocketPingInterval)
	var writeMutex sync.Mutex // Needed because ticker & copy are writing to frontend in separate goroutines

	defer func() {
		log.Infof("Closing terminal session for device: %s", deviceId)
		ticker.Stop()
		frontend.Close()
	}()

	errc := make(chan error, 2)

	// Can't just use io.Copy here since browsers care about frame headers.
	go func() { errc <- copyMsgs(nil, frontend, backend) }()
	go func() { errc <- copyMsgs(&writeMutex, backend, frontend) }()

	for {
		select {
		case <-errc:
			// Only wait for a single error and let the defers close both connections.
			return
		case <-ticker.C:
			writeMutex.Lock()
			// Send pings to client to prevent load balancers and other middlemen from closing the connection early
			err := frontend.WriteControl(websocket.PingMessage, []byte{}, time.Now().Add(websocketTimeout))
			writeMutex.Unlock()
			if err != nil {
				return
			}
		}
	}
}
