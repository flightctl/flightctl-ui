package main

import (
	"log"
	"net/http"
	"time"

	gorillaHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"

	"github.com/flightctl/flightctl-ui/bridge"
	"github.com/flightctl/flightctl-ui/server"
	"github.com/flightctl/flightctl-ui/utils"
)

func corsHandler(router *mux.Router) http.Handler {
	return gorillaHandlers.CORS(
		gorillaHandlers.AllowedOrigins([]string{"*"}),
		gorillaHandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE"}),
		gorillaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)(router)
}

func main() {
	router := mux.NewRouter()

	apiRouter := router.PathPrefix("/api").Subrouter()

	apiRouter.Use(bridge.AuthMiddleware)

	apiRouter.Handle("/flightctl/{forward:.*}", bridge.NewFlightCtlHandler(utils.GetEnvVar("FLIGHTCTL_SERVER", "https://localhost:3333")))
	apiRouter.Handle("/metrics/{forward:.*}", bridge.NewMetricsHandler(utils.GetEnvVar("FLIGHTCTL_METRICS_SERVER", "http://localhost:9090")))

	spa := server.SpaHandler{}
	router.PathPrefix("/").Handler(server.GzipHandler(spa))

	addr := ":" + utils.GetEnvVar("API_PORT", "3001")

	srv := &http.Server{
		Handler:      corsHandler(router),
		Addr:         addr,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}
	log.Println("Proxy running at", addr)
	log.Fatal(srv.ListenAndServe())
}
