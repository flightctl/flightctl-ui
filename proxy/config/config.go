package config

import (
	"os"
	"strings"
)

var (
	BridgePort      = ":" + getEnvVar("API_PORT", "3001")
	FctlApiUrl      = getEnvUrlVar("FLIGHTCTL_SERVER", "https://localhost:3443")
	FctlApiInsecure = getEnvVar("FLIGHTCTL_SERVER_INSECURE_SKIP_VERIFY", "false")
	MetricsApiUrl   = getEnvUrlVar("FLIGHTCTL_METRICS_SERVER", "http://localhost:9090")
	GrpcUrl         = getEnvUrlVar("FLIGHTCTL_GRPC_SERVER", "localhost:7444")
	TlsKeyPath      = getEnvVar("TLS_KEY", "")
	TlsCertPath     = getEnvVar("TLS_CERT", "")
	OidcClientId    = getEnvVar("OIDC_CLIENT_ID", "flightctl")
	BaseUiUrl       = getEnvUrlVar("BASE_UI_URL", "http://localhost:9000")
	InternalOIDCUrl = getEnvUrlVar("INTERNAL_OIDC_URL", "")
	OIDCInsecure    = getEnvVar("OIDC_INSECURE_SKIP_VERIFY", "false")
	BootcImg        = getEnvVar("BOOTC_IMG_URL", "")
	Qcow2Img        = getEnvVar("QCOW2_IMG_URL", "")
	OcpPlugin       = getEnvVar("IS_OCP_PLUGIN", "false")
)

func getEnvUrlVar(key string, defaultValue string) string {
	urlValue := getEnvVar(key, defaultValue)
	return strings.TrimSuffix(urlValue, "/")
}

func getEnvVar(key string, defaultValue string) string {
	val, ok := os.LookupEnv(key)
	if !ok {
		return defaultValue
	}
	return val
}
