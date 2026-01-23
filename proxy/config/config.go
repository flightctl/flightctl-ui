package config

import (
	"os"
	"strings"
)

var (
	BridgePort             = ":" + getEnvVar("API_PORT", "3001")
	FctlApiUrl             = getEnvUrlVar("FLIGHTCTL_SERVER", "https://localhost:3443")
	FctlApiExternalUrl     = getEnvUrlVar("FLIGHTCTL_SERVER_EXTERNAL", "https://localhost:3443")
	FctlImageBuilderApiUrl = getEnvUrlVar("FLIGHTCTL_IMAGEBUILDER_SERVER", "https://localhost:8445")
	FctlApiInsecure        = getEnvVar("FLIGHTCTL_SERVER_INSECURE_SKIP_VERIFY", "false")
	FctlCliArtifactsUrl    = getEnvUrlVar("FLIGHTCTL_CLI_ARTIFACTS_SERVER", "http://localhost:8090")
	AlertManagerApiUrl     = getEnvUrlVar("FLIGHTCTL_ALERTMANAGER_PROXY", "https://localhost:8443")
	TlsKeyPath             = getEnvVar("TLS_KEY", "")
	TlsCertPath            = getEnvVar("TLS_CERT", "")
	BaseUiUrl              = getEnvUrlVar("BASE_UI_URL", "http://localhost:9000")
	AuthInsecure           = getEnvVar("AUTH_INSECURE_SKIP_VERIFY", "")
	OcpPlugin              = getEnvVar("IS_OCP_PLUGIN", "false")
	IsRHEM                 = getEnvVar("IS_RHEM", "")
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
