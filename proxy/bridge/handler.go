package bridge

import (
	"crypto/tls"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/gorilla/mux"
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
	return target, proxy
}

func NewFlightCtlHandler(apiURL string, tlsConfig *tls.Config) handler {
	target, proxy := createReverseProxy(apiURL)

	proxy.Transport = &http.Transport{
		TLSClientConfig: tlsConfig,
	}

	return handler{target: target, proxy: proxy}
}

func NewMetricsHandler(apiURL string) handler {
	target, proxy := createReverseProxy(apiURL)
	return handler{target: target, proxy: proxy}
}
