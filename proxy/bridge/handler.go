package bridge

import (
	"crypto/tls"
	"errors"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/gorilla/mux"

	"github.com/flightctl/flightctl-ui/common"
	"github.com/flightctl/flightctl-ui/config"
	log "github.com/sirupsen/logrus"
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
		panic(err)
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
		return nil
	}
	originalDirector := proxy.Director
	proxy.Director = func(r *http.Request) {
		originalDirector(r)
		cookie, err := r.Cookie(common.CookieSessionName)
		if err != nil && !errors.Is(err, http.ErrNoCookie) {
			log.Warnf("Failed to get session cookie: %s", err.Error())
		}
		if cookie != nil {
			r.Header.Add("Authorization", "Bearer "+cookie.Value)
		}
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

func NewMetricsHandler() handler {
	target, proxy := createReverseProxy(config.MetricsApiUrl)
	return handler{target: target, proxy: proxy}
}
