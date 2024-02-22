package bridge

import (
	"crypto/tls"
	"crypto/x509"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"

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
	return target, proxy
}

func NewFlightCtlHandler(apiURL string) handler {
	target, proxy := createReverseProxy(apiURL)

	caCert, err := os.ReadFile("../certs/ca.crt")
	if err != nil {
		panic(err)
	}
	caCertPool := x509.NewCertPool()
	caCertPool.AppendCertsFromPEM(caCert)

	cert, err := tls.LoadX509KeyPair("../certs/front-cli.crt", "../certs/front-cli.key")
	if err != nil {
		panic(err)
	}

	proxy.Transport = &http.Transport{
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: true,
			RootCAs:            caCertPool,
			Certificates:       []tls.Certificate{cert},
		},
	}

	return handler{target: target, proxy: proxy}
}

func NewMetricsHandler(apiURL string) handler {
	target, proxy := createReverseProxy(apiURL)
	return handler{target: target, proxy: proxy}
}
