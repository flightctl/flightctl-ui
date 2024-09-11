package middleware

import (
	"net/http"
	"net/textproto"
	"strings"

	"github.com/flightctl/flightctl-ui/common"
)

var protocolHeader = textproto.CanonicalMIMEHeaderKey("Sec-WebSocket-Protocol")

// This function does not verify the auth token. It just makes sure that the token is injected into Auth header
func WsAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.RequestURI, "/api/terminal/") {
			protocolHeaderVal, ok := r.Header[protocolHeader]
			if !ok {
				http.Error(w, "Failed to get protocol header", http.StatusBadRequest)
				return
			}
			protocols := strings.Split(protocolHeaderVal[0], ",")
			if protocols[0] == common.WsStandaloneSubprotocol {
				// UI can not specify headers for WS connection.
				// We need to move the token from protocol to the header.
				cookie, _ := r.Cookie(common.CookieSessionName)
				if cookie == nil {
					// no auth
					r.Header[common.AuthHeaderKey] = []string{"Bearer "}
				} else {
					r.Header[common.AuthHeaderKey] = []string{"Bearer " + cookie.Value}
				}
			}
		}
		next.ServeHTTP(w, r)
	})
}
