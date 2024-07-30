package bridge

import (
	"crypto/tls"
	"crypto/x509"
	"errors"
	"net/http"
	"net/textproto"
	"os"
	"strings"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/flightctl/flightctl-ui/utils"
)

var protocolHeader = textproto.CanonicalMIMEHeaderKey("Sec-WebSocket-Protocol")

func getAuthHeaderValue(r *http.Request) (string, error) {
	authHeader, ok := r.Header["Authorization"]
	if !ok || len(authHeader) != 1 {
		return "", errors.New("missing Authorization header")
	}

	authHeaderValueSplit := strings.Split(authHeader[0], "Bearer ")
	if len(authHeaderValueSplit) != 2 {
		return "", errors.New("incorrect Authorization header")
	}
	return authHeaderValueSplit[1], nil
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		keycloakAuth := utils.GetEnvVar("BACKEND_KEYCLOAK_AUTHORITY", utils.GetEnvVar("KEYCLOAK_AUTHORITY", ""))
		if keycloakAuth == "" {
			next.ServeHTTP(w, r)
			return
		}

		bearer := ""

		if strings.HasPrefix(r.RequestURI, "/api/terminal/") {
			protocolHeaderVal, ok := r.Header[protocolHeader]
			if !ok || len(protocolHeaderVal) != 1 {
				http.Error(w, "Missing protocol header", http.StatusForbidden)
				return
			}
			protocols := strings.Split(protocolHeaderVal[0], ",")
			if protocols[0] == wsStandaloneSubprotocol {
				if len(protocols) != 2 {
					http.Error(w, "Missing Authorization header", http.StatusForbidden)
					return
				}

				bearer = strings.TrimSpace(protocols[1])
			} else if protocols[0] == wsOcpSubprotocol {
				bearerVal, err := getAuthHeaderValue(r)
				if err != nil {
					http.Error(w, err.Error(), http.StatusForbidden)
				}
				bearer = bearerVal
			} else {
				http.Error(w, "Unknown auth subprotocol", http.StatusForbidden)
				return
			}

		} else {
			bearerVal, err := getAuthHeaderValue(r)
			if err != nil {
				http.Error(w, err.Error(), http.StatusForbidden)
			}
			bearer = bearerVal
		}

		provider, err := oidc.NewProvider(r.Context(), keycloakAuth)
		if err != nil {
			http.Error(w, "Failed to verify auth token: "+err.Error(), http.StatusForbidden)
			return
		}

		verifier := provider.Verifier(&oidc.Config{SkipClientIDCheck: true, SkipIssuerCheck: true})

		_, err = verifier.Verify(r.Context(), bearer)
		if err != nil {
			http.Error(w, "Failed to verify auth token: "+err.Error(), http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func GetTlsConfig() (*tls.Config, error) {
	caCert, err := os.ReadFile("../certs/ca.crt")
	if err != nil {
		return nil, err
	}
	caCertPool := x509.NewCertPool()
	caCertPool.AppendCertsFromPEM(caCert)
	cert, err := tls.LoadX509KeyPair("../certs/front-cli.crt", "../certs/front-cli.key")
	if err != nil {
		return nil, err
	}

	tlsConfig := &tls.Config{
		InsecureSkipVerify: true,
		RootCAs:            caCertPool,
		Certificates:       []tls.Certificate{cert},
	}
	return tlsConfig, nil
}
