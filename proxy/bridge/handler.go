package bridge

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"

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

// To be able to trigger the download in the browser, the UI must be able to obtain the "Location" header for a redirect.
// With both "redirect:follow/manual", we wouldn't be able to obtain the "Location" header or have the browser trigger the download.
// To solve this, we rewrite the response from ImageBuilder API to 200 with JSON body {"redirectUrl": "<Location>"}
type imagebuilderDownloadRewriteTransport struct {
	base http.RoundTripper
}

func (t *imagebuilderDownloadRewriteTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	resp, err := t.base.RoundTrip(req)
	if err != nil || resp == nil {
		return resp, err
	}
	if !strings.HasSuffix(strings.TrimSuffix(req.URL.Path, "/"), "/download") {
		return resp, nil
	}

	if resp.StatusCode != http.StatusFound && resp.StatusCode != http.StatusMovedPermanently &&
		resp.StatusCode != http.StatusTemporaryRedirect && resp.StatusCode != http.StatusPermanentRedirect {
		return resp, nil
	}
	location := resp.Header.Get("Location")
	if location == "" {
		return resp, nil
	}
	body, _ := json.Marshal(map[string]string{"redirectUrl": location})
	_ = resp.Body.Close()
	resp.StatusCode = http.StatusOK
	resp.Status = "200 OK"
	resp.Header = http.Header{}
	resp.Header.Set("Content-Type", "application/json")
	resp.ContentLength = int64(len(body))
	resp.Body = io.NopCloser(bytes.NewReader(body))
	return resp, nil
}

func NewImageBuilderHandler(tlsConfig *tls.Config) handler {
	target, proxy := createReverseProxy(config.FctlImageBuilderApiUrl)

	baseTransport := &http.Transport{
		TLSClientConfig: tlsConfig,
	}
	proxy.Transport = &imagebuilderDownloadRewriteTransport{base: baseTransport}

	return handler{target: target, proxy: proxy}
}

func UnimplementedHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
}
