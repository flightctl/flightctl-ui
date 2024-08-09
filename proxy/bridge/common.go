package bridge

import (
	"crypto/tls"
	"crypto/x509"
	"errors"
	"os"

	"github.com/flightctl/flightctl-ui/utils"
	"github.com/sirupsen/logrus"
)

const AuthHeaderKey = "Authorization"

func GetTlsConfig(log *logrus.Logger) (*tls.Config, error) {
	tlsConfig := &tls.Config{}

	insecure := utils.GetEnvVar("FLIGHTCTL_SERVER_INSECURE_SKIP_VERIFY", "false")
	if insecure == "true" {
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
