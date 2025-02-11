package bridge

import (
	"crypto/tls"
	"fmt"
	"net/http"
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

	deviceId, found := strings.CutPrefix(r.URL.Path, "/api/terminal/")
	if !found {
		log.Warnf("Failed to get deviceId: %s", deviceId)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	log.Infof("Starting terminal session for device: %s", deviceId)
	wsApi, _ := strings.CutPrefix(config.FctlApiUrl, "https://")
	consoleUrl := fmt.Sprintf("wss://%s/ws/v1/devices/%s/console", wsApi, deviceId)

	dialer := &websocket.Dialer{
		TLSClientConfig: t.TlsConfig,
	}

	backend, resp, err := dialer.Dial(consoleUrl, r.Header)
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
		Subprotocols: []string{common.WsStandaloneSubprotocol, common.WsOcpSubprotocol},
		CheckOrigin:  func(r *http.Request) bool { return true },
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
