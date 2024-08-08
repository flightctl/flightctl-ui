package main

import (
	"crypto/tls"
	"net/http"
	"time"

	gorillaHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"

	"github.com/flightctl/flightctl-ui/bridge"
	"github.com/flightctl/flightctl-ui/log"
	"github.com/flightctl/flightctl-ui/middleware"
	"github.com/flightctl/flightctl-ui/server"
	"github.com/flightctl/flightctl-ui/utils"
)

var (
	bridgePort    = ":" + utils.GetEnvVar("API_PORT", "3001")
	fctlApiUrl    = utils.GetEnvVar("FLIGHTCTL_SERVER", "https://localhost:3443")
	metricsApiUrl = utils.GetEnvVar("FLIGHTCTL_METRICS_SERVER", "http://localhost:9090")
	tlsKeyPath    = utils.GetEnvVar("TLS_KEY", "")
	tlsCertPath   = utils.GetEnvVar("TLS_CERT", "")
)

func corsHandler(router *mux.Router) http.Handler {
	return gorillaHandlers.CORS(
		gorillaHandlers.AllowedOrigins([]string{"*"}),
		gorillaHandlers.AllowedMethods([]string{"GET", "POST", "DELETE", "PATCH"}),
		gorillaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)(router)
}

func main() {
	log := log.InitLogs()
	router := mux.NewRouter()
	apiRouter := router.PathPrefix("/api").Subrouter()
	apiRouter.Use(middleware.WsAuthMiddleware)

	tlsConfig, err := bridge.GetTlsConfig()
	if err != nil {
		panic(err)
	}

	apiRouter.Handle("/flightctl/{forward:.*}", bridge.NewFlightCtlHandler(fctlApiUrl, tlsConfig))
	apiRouter.Handle("/metrics/{forward:.*}", bridge.NewMetricsHandler(metricsApiUrl))

	terminalBridge := bridge.TerminalBridge{ApiUrl: fctlApiUrl, TlsConfig: tlsConfig, Log: log}
	apiRouter.HandleFunc("/terminal/{forward:.*}", terminalBridge.HandleTerminal)

	spa := server.SpaHandler{}
	router.PathPrefix("/").Handler(server.GzipHandler(spa))

	var config *tls.Config

	if tlsKeyPath != "" && tlsCertPath != "" {
		cert, err := tls.LoadX509KeyPair(tlsCertPath, tlsKeyPath)
		if err != nil {
			panic(err)
		}
		config = &tls.Config{
			Certificates: []tls.Certificate{cert},
		}

	}

	srv := &http.Server{
		Handler:      corsHandler(router),
		Addr:         bridgePort,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Info("Proxy running at", bridgePort)

	if config != nil {
		srv.TLSConfig = config
		log.Info("Running as HTTPS")
		log.Fatal(srv.ListenAndServeTLS("", ""))
	} else {
		log.Fatal(srv.ListenAndServe())
	}

}
