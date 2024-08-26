package middleware

import (
	"net/http"
	"net/textproto"
	"strings"

	"github.com/flightctl/flightctl-ui/bridge"
)

var protocolHeader = textproto.CanonicalMIMEHeaderKey("Sec-WebSocket-Protocol")

// This function does not verify the auth token. It just makes sure that the token is injected into Auth header
func WsAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.RequestURI, "/api/terminal/") {
			protocolHeaderVal, ok := r.Header[protocolHeader]
			if !ok || len(protocolHeaderVal) != 1 {
				http.Error(w, "Missing protocol header", http.StatusBadRequest)
				return
			}
			protocols := strings.Split(protocolHeaderVal[0], ",")
			if protocols[0] == bridge.WsStandaloneSubprotocol {
				// UI can not specify headers for WS connection.
				// We need to move the token from protocol to the header.
				if len(protocols) == 2 {
					r.Header[bridge.AuthHeaderKey] = []string{"Bearer " + strings.TrimSpace(protocols[1])}
				} else {
					// no auth
					r.Header[bridge.AuthHeaderKey] = []string{"Bearer "}
				}
			}
		}
		next.ServeHTTP(w, r)
	})
}
