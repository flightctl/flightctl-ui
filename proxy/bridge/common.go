package bridge

import (
	"crypto/tls"
	"crypto/x509"
	"errors"
	"net/url"
	"os"

	"github.com/flightctl/flightctl-ui/config"
	log "github.com/sirupsen/logrus"
)

func GetTlsConfig() (*tls.Config, error) {
	tlsConfig := &tls.Config{}

	if config.FctlApiInsecure == "true" {
		log.Warn("Using InsecureSkipVerify for API communication")
		tlsConfig.InsecureSkipVerify = true
	}

	_, err := os.Stat("../certs/ca.crt")
	if errors.Is(err, os.ErrNotExist) {
		return tlsConfig, nil
	}
	caCert, err := os.ReadFile("../certs/ca.crt")
	if err != nil {
		return nil, err
	}

	caCertPool, err := x509.SystemCertPool()
	if err != nil {
		return nil, err
	}
	caCertPool.AppendCertsFromPEM(caCert)

	tlsConfig.RootCAs = caCertPool
	return tlsConfig, nil
}

func GetAuthTlsConfig() (*tls.Config, error) {
	tlsConfig := &tls.Config{}

	if config.AuthInsecure == "true" {
		log.Warn("Using InsecureSkipVerify for Auth communication")
		tlsConfig.InsecureSkipVerify = true
	}

	_, err := os.Stat("../certs/ca_auth.crt")
	if errors.Is(err, os.ErrNotExist) {
		return tlsConfig, nil
	}
	caCert, err := os.ReadFile("../certs/ca_auth.crt")
	if err != nil {
		return nil, err
	}

	caCertPool, err := x509.SystemCertPool()
	if err != nil {
		return nil, err
	}
	caCertPool.AppendCertsFromPEM(caCert)

	tlsConfig.RootCAs = caCertPool
	return tlsConfig, nil
}

// sanitizeQueryForSSRF sanitizes a raw query string by parsing and re-encoding it
func sanitizeQueryForSSRF(rawQuery string) (string, error) {
	if rawQuery == "" {
		return "", nil
	}

	parsedQuery, err := url.ParseQuery(rawQuery)
	if err != nil {
		return "", err
	}

	// Re-encode the query string to sanitize it
	return parsedQuery.Encode(), nil
}
