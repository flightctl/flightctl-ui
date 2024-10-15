package main

import (
	"crypto/tls"
	"net/http"
	"time"

	gorillaHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"

	"github.com/flightctl/flightctl-ui/auth"
	"github.com/flightctl/flightctl-ui/bridge"
	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
	"github.com/flightctl/flightctl-ui/middleware"
	"github.com/flightctl/flightctl-ui/server"
)

func corsHandler(router *mux.Router) http.Handler {
	return gorillaHandlers.CORS(
		gorillaHandlers.AllowedOrigins([]string{"http://localhost:9000"}),
		gorillaHandlers.AllowedMethods([]string{"GET", "POST", "DELETE", "PATCH"}),
		gorillaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
		gorillaHandlers.AllowCredentials(),
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

	apiRouter.Handle("/flightctl/{forward:.*}", bridge.NewFlightCtlHandler(tlsConfig))
	apiRouter.Handle("/metrics/{forward:.*}", bridge.NewMetricsHandler())

	terminalBridge := bridge.TerminalBridge{TlsConfig: tlsConfig, Log: log}
	apiRouter.HandleFunc("/terminal/{forward:.*}", terminalBridge.HandleTerminal)
	apiRouter.HandleFunc("/device-images", bridge.HandleDeviceImages)

	if config.OcpPlugin != "true" {
		oidcTlsConfig, err := bridge.GetOIDCTlsConfig()
		if err != nil {
			panic(err)
		}

		oidcHandler, err := auth.NewOIDCAuth(oidcTlsConfig, tlsConfig, config.TlsCertPath != "")
		if err != nil {
			panic(err)
		}
		apiRouter.HandleFunc("/login", oidcHandler.Login)
		apiRouter.HandleFunc("/login/info", oidcHandler.GetUserInfo)
		apiRouter.HandleFunc("/logout", oidcHandler.Logout)
	}

	spa := server.SpaHandler{}
	router.PathPrefix("/").Handler(server.GzipHandler(spa))

	var serverTlsconfig *tls.Config

	if config.TlsKeyPath != "" && config.TlsCertPath != "" {
		cert, err := tls.LoadX509KeyPair(config.TlsCertPath, config.TlsKeyPath)
		if err != nil {
			panic(err)
		}
		serverTlsconfig = &tls.Config{
			Certificates: []tls.Certificate{cert},
		}

	}

	srv := &http.Server{
		Handler:      corsHandler(router),
		Addr:         config.BridgePort,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Info("Proxy running at", config.BridgePort)

	if serverTlsconfig != nil {
		srv.TLSConfig = serverTlsconfig
		log.Info("Running as HTTPS")
		log.Fatal(srv.ListenAndServeTLS("", ""))
	} else {
		log.Fatal(srv.ListenAndServe())
	}

}
