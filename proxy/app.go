package main

import (
	"crypto/tls"
	"net/http"
	"os"
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
		gorillaHandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "PATCH"}),
		gorillaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization", "X-FlightCtl-Organization-ID"}),
		gorillaHandlers.AllowCredentials(),
	)(router)
}

func main() {
	log := log.InitLogs()
	router := mux.NewRouter()
	apiRouter := router.PathPrefix("/api").Subrouter()

	apiRouter.Use(middleware.AuthMiddleware)
	apiRouter.Use(middleware.OrganizationMiddleware)

	tlsConfig, err := bridge.GetTlsConfig()
	if err != nil {
		log.WithError(err).Error("Failed to get TLS configuration")
		os.Exit(1)
	}

	apiRouter.Handle("/flightctl/{forward:.*}", bridge.NewFlightCtlHandler(tlsConfig))

	alertManagerUrl, alertManagerEnabled := os.LookupEnv("FLIGHTCTL_ALERTMANAGER_PROXY")
	if alertManagerEnabled && alertManagerUrl != "" {
		apiRouter.Handle("/alerts/{forward:.*}", bridge.NewAlertManagerHandler(tlsConfig))
	} else {
		apiRouter.HandleFunc("/alerts/{forward:.*}", bridge.UnimplementedHandler)
	}

	cliArtifactsUrl, cliArtifactsEnabled := os.LookupEnv("FLIGHTCTL_CLI_ARTIFACTS_SERVER")
	if cliArtifactsEnabled && cliArtifactsUrl != "" {
		apiRouter.Handle("/cli-artifacts", bridge.NewFlightCtlCliArtifactsHandler(tlsConfig))
	} else {
		apiRouter.HandleFunc("/cli-artifacts", bridge.UnimplementedHandler)
	}

	terminalBridge := bridge.TerminalBridge{TlsConfig: tlsConfig}
	apiRouter.HandleFunc("/terminal/{forward:.*}", terminalBridge.HandleTerminal)

	testAuthHandler := bridge.NewTestAuthHandler(tlsConfig)
	apiRouter.HandleFunc("/test-auth-provider-connection", testAuthHandler.TestConnection)

	if config.OcpPlugin != "true" {
		authHandler, err := auth.NewAuth(tlsConfig)
		if err != nil {
			log.WithError(err).Error("Failed to initialize authentication")
			os.Exit(1)
		}
		apiRouter.HandleFunc("/login", authHandler.Login)
		apiRouter.HandleFunc("/login/info", authHandler.GetUserInfo)
		apiRouter.HandleFunc("/login/refresh", authHandler.Refresh)
		apiRouter.HandleFunc("/logout", authHandler.Logout)
		apiRouter.HandleFunc("/login-command", authHandler.GetLoginCommand)
	}

	spa := server.SpaHandler{}
	router.PathPrefix("/").Handler(server.GzipHandler(spa))

	var serverTlsconfig *tls.Config

	if config.TlsKeyPath != "" && config.TlsCertPath != "" {
		cert, err := tls.LoadX509KeyPair(config.TlsCertPath, config.TlsKeyPath)
		if err != nil {
			log.WithError(err).Error("Failed to load TLS certificate")
			os.Exit(1)
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
