package bridge

import (
	"crypto/tls"
	"crypto/x509"
	"net/http"
	"os"
	"strings"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/flightctl/flightctl-ui/utils"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		keycloakAuth := utils.GetEnvVar("BACKEND_KEYCLOAK_AUTHORITY", utils.GetEnvVar("KEYCLOAK_AUTHORITY", ""))
		if keycloakAuth == "" {
			next.ServeHTTP(w, r)
			return
		}
		authHeader, ok := r.Header["Authorization"]
		if !ok || len(authHeader) != 1 {
			http.Error(w, "Missing Authorization header", http.StatusForbidden)
			return
		}

		bearer := strings.Split(authHeader[0], "Bearer ")
		if len(bearer) != 2 {
			http.Error(w, "Incorrect Authorization header", http.StatusForbidden)
			return
		}
		provider, err := oidc.NewProvider(r.Context(), keycloakAuth)
		if err != nil {
			http.Error(w, "Failed to verify auth token: "+err.Error(), http.StatusForbidden)
			return
		}

		verifier := provider.Verifier(&oidc.Config{SkipClientIDCheck: true, SkipIssuerCheck: true})

		_, err = verifier.Verify(r.Context(), bearer[1])
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
