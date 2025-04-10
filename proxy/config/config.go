package config

import (
	"os"
	"strings"
)

var (
	BridgePort          = ":" + getEnvVar("API_PORT", "3001")
	FctlApiUrl          = getEnvUrlVar("FLIGHTCTL_SERVER", "https://localhost:3443")
	FctlApiInsecure     = getEnvVar("FLIGHTCTL_SERVER_INSECURE_SKIP_VERIFY", "false")
	MetricsApiUrl       = getEnvUrlVar("FLIGHTCTL_METRICS_SERVER", "http://localhost:9090")
	FctlCliArtifactsUrl = getEnvUrlVar("FLIGHTCTL_CLI_ARTIFACTS_SERVER", "http://localhost:8090")
	TlsKeyPath          = getEnvVar("TLS_KEY", "")
	TlsCertPath         = getEnvVar("TLS_CERT", "")
	AuthClientId        = getEnvVar("AUTH_CLIENT_ID", "flightctl")
	BaseUiUrl           = getEnvUrlVar("BASE_UI_URL", "http://localhost:9000")
	InternalAuthUrl     = getEnvUrlVar("INTERNAL_AUTH_URL", "")
	AuthInsecure        = getEnvVar("AUTH_INSECURE_SKIP_VERIFY", "")
	OcpPlugin           = getEnvVar("IS_OCP_PLUGIN", "false")
	RBACNs              = getEnvVar("K8S_RBAC_NS", "")
	IsRHEM              = getEnvVar("IS_RHEM", "")
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
