package bridge

import (
	"crypto/tls"
	"crypto/x509"
	"errors"
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

	caCertPool := x509.NewCertPool()
	caCertPool.AppendCertsFromPEM(caCert)

	tlsConfig.RootCAs = caCertPool
	return tlsConfig, nil
}

func GetOIDCTlsConfig() (*tls.Config, error) {
	tlsConfig := &tls.Config{}

	if config.OIDCInsecure == "true" {
		log.Warn("Using InsecureSkipVerify for OIDC communication")
		tlsConfig.InsecureSkipVerify = true
	}

	_, err := os.Stat("../certs/ca_oidc.crt")
	if errors.Is(err, os.ErrNotExist) {
		return tlsConfig, nil
	}
	caCert, err := os.ReadFile("../certs/ca_oidc.crt")
	if err != nil {
		return nil, err
	}

	caCertPool := x509.NewCertPool()
	caCertPool.AppendCertsFromPEM(caCert)

	tlsConfig.RootCAs = caCertPool
	return tlsConfig, nil
}
