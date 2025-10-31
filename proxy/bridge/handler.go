package bridge

import (
	"crypto/tls"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"

	"github.com/gorilla/mux"

	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
)

type handler struct {
	target *url.URL
	proxy  *httputil.ReverseProxy
}

func (h handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	r.URL.Host = h.target.Host
	r.URL.Scheme = h.target.Scheme
	r.Header.Set("X-Forwarded-Host", r.Header.Get("Host"))
	r.Host = h.target.Host
	r.URL.Path = mux.Vars(r)["forward"]
	h.proxy.ServeHTTP(w, r)
}

func createReverseProxy(apiURL string) (*url.URL, *httputil.ReverseProxy) {
	target, err := url.Parse(apiURL)
	if err != nil {
		log.GetLogger().WithError(err).Errorf("Failed to parse URL '%s'", apiURL)
		os.Exit(1)
	}
	proxy := httputil.NewSingleHostReverseProxy(target)
	proxy.ModifyResponse = func(r *http.Response) error {
		filterHeaders := []string{
			"Access-Control-Allow-Headers",
			"Access-Control-Allow-Methods",
			"Access-Control-Allow-Origin",
			"Access-Control-Expose-Headers",
		}
		for _, h := range filterHeaders {
			r.Header.Del(h)
		}

		// If the backend returns 401 Unauthorized, clear the session cookie
		// This handles the case where the token in the cookie has expired
		if r.StatusCode == http.StatusUnauthorized {
			r.Header.Set("Clear-Site-Data", `"cookies"`)
			log.GetLogger().Debug("Backend returned 401, clearing session cookies")
		}

		return nil
	}
	return target, proxy
}

func createAlertsReverseProxy(apiURL string) (*url.URL, *httputil.ReverseProxy) {
	target, err := url.Parse(apiURL)
	if err != nil {
		log.GetLogger().WithError(err).Errorf("Failed to parse URL '%s'", apiURL)
		os.Exit(1)
	}
	proxy := httputil.NewSingleHostReverseProxy(target)
	proxy.ModifyResponse = func(r *http.Response) error {
		filterHeaders := []string{
			"Access-Control-Allow-Headers",
			"Access-Control-Allow-Methods",
			"Access-Control-Allow-Origin",
			"Access-Control-Expose-Headers",
		}
		for _, h := range filterHeaders {
			r.Header.Del(h)
		}

		// For alerts API, we may sometimes receive 401 instead of 403.
		// To prevent login out the user, we convert 401 to 501.
		if r.StatusCode == http.StatusUnauthorized {
			r.StatusCode = http.StatusNotImplemented
			r.Status = "501 Not Implemented"
			log.GetLogger().Debug("Alerts API returned 401, converting to 501 (disabled)")
		}

		return nil
	}
	return target, proxy
}

func NewFlightCtlHandler(tlsConfig *tls.Config) handler {
	target, proxy := createReverseProxy(config.FctlApiUrl)

	proxy.Transport = &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	return handler{target: target, proxy: proxy}
}

func NewFlightCtlCliArtifactsHandler(tlsConfig *tls.Config) handler {
	target, proxy := createReverseProxy(config.FctlCliArtifactsUrl)

	proxy.Transport = &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	return handler{target: target, proxy: proxy}
}

func NewAlertManagerHandler(tlsConfig *tls.Config) handler {
	target, proxy := createAlertsReverseProxy(config.AlertManagerApiUrl)

	proxy.Transport = &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	return handler{target: target, proxy: proxy}
}

func UnimplementedHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
}
