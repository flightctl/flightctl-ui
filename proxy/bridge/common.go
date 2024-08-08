package bridge

import (
	"crypto/tls"
	"crypto/x509"
	"os"
)

func GetTlsConfig() (*tls.Config, error) {
	caCert, err := os.ReadFile("../certs/ca.crt")
	if err != nil {
		return nil, err
	}
	caCertPool := x509.NewCertPool()
	caCertPool.AppendCertsFromPEM(caCert)

	tlsConfig := &tls.Config{
		RootCAs: caCertPool,
	}
	return tlsConfig, nil
}
