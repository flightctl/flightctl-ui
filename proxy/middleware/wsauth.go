package middleware

import (
	"net/http"
	"net/textproto"
	"strings"

	"github.com/flightctl/flightctl-ui/bridge"
)

var protocolHeader = textproto.CanonicalMIMEHeaderKey("Sec-WebSocket-Protocol")

const authHeaderKey = "Authorization"

// This function does not verify the auth token. It just makes sure that the token is injected into Auth header
func WsAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.RequestURI, "/api/terminal/") {
			protocolHeaderVal, ok := r.Header[protocolHeader]
			if !ok || len(protocolHeaderVal) != 1 {
				http.Error(w, "Missing protocol header", http.StatusForbidden)
				return
			}
			protocols := strings.Split(protocolHeaderVal[0], ",")
			// UI can not specify headers for WS connection.
			// We need to move the token from protocol to the header.
			if protocols[0] == bridge.WsStandaloneSubprotocol {
				if len(protocols) != 2 {
					http.Error(w, "Missing Authorization header", http.StatusForbidden)
					return
				}
				r.Header[authHeaderKey] = []string{"Bearer " + strings.TrimSpace(protocols[1])}
			}
		}
		next.ServeHTTP(w, r)
	})
}
