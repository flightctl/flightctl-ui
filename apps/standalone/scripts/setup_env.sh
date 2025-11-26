#!/bin/sh

flightctl_namespace="flightctl-external"

# Validates that the script can run properly to detect the backend deployment setttings
validate_prerequisites() {
    if ! command -v kubectl >/dev/null 2>&1; then
        echo "❌ Error: kubectl not found. " >&2
        exit 1
    fi
    
    if ! kubectl config get-contexts kind-kind >/dev/null 2>&1; then
        echo "❌ Error: kind-kind context not found. Please deploy flightctl first." >&2
        exit 1
    fi
    
    if ! kubectl get namespaces --context kind-kind >/dev/null 2>&1; then
        echo "❌ Error: Cannot connect to kind cluster. Please check your setup." >&2
        exit 1
    fi
}

# Function to get external IP address
get_external_ip() {
    if which ip 2>/dev/null 1>/dev/null; then
        ip route get 1.1.1.1 | grep -oP 'src \K\S+'
    else
        # MacOS does not have ip, so we use route and ifconfig instead
        INTERFACE=$(route get 1.1.1.1 | grep interface | awk '{print $2}')
        ifconfig | grep $INTERFACE -A 10 | grep "inet " | grep -Fv 127.0.0.1 | awk '{print $2}' | head -n 1
    fi
}

# Function that determines if a setting is enabled based on the presence of a service in the kind cluster
detect_service_setting() {
    setting_name="$1"
    service_name="$2"
    
    if kubectl get service "$service_name" -n "$flightctl_namespace" --context kind-kind >/dev/null 2>&1; then
        echo "Autodetected: $setting_name enabled ✅" >&2
        echo "true"
    else
        echo "Autodetected: $setting_name disabled ❌" >&2
        echo "false"
    fi
    return 0
}

# Check that the Backend is running in a kind cluster and we can access it
validate_prerequisites

# Get the external IP address
EXTERNAL_IP=$(get_external_ip)

if [ -z "$EXTERNAL_IP" ]; then
    echo "Error: Could not determine external IP address" >&2
    exit 1
fi

echo "Using external IP: $EXTERNAL_IP" >&2

# Set core environment variables for kind development
export FLIGHTCTL_SERVER_INSECURE_SKIP_VERIFY='true'
export FLIGHTCTL_SERVER="https://$EXTERNAL_IP:3443"

# CLI artifacts - get setting from kind cluster, unless it has been configured already
if [ -z "$ENABLE_CLI_ARTIFACTS" ]; then
    ENABLE_CLI_ARTIFACTS=$(detect_service_setting "CLI artifacts" "flightctl-cli-artifacts")
fi
export ENABLE_CLI_ARTIFACTS
if [ "$ENABLE_CLI_ARTIFACTS" = "true" ]; then
    export FLIGHTCTL_CLI_ARTIFACTS_SERVER="http://$EXTERNAL_IP:8090"
else
    unset FLIGHTCTL_CLI_ARTIFACTS_SERVER
fi

# AlertManager - get setting from kind cluster, unless it has been configured already
if [ -z "$ENABLE_ALERTMANAGER" ]; then
    ENABLE_ALERTMANAGER=$(detect_service_setting "AlertManager" "flightctl-alertmanager-proxy")
fi
export ENABLE_ALERTMANAGER
if [ "$ENABLE_ALERTMANAGER" = "true" ]; then
    export FLIGHTCTL_ALERTMANAGER_PROXY="https://$EXTERNAL_IP:8443"
else
    unset FLIGHTCTL_ALERTMANAGER_PROXY
fi

echo ""
echo "🌐 Environment variables set:" >&2
echo "  FLIGHTCTL_SERVER_INSECURE_SKIP_VERIFY=$FLIGHTCTL_SERVER_INSECURE_SKIP_VERIFY" >&2
echo "  FLIGHTCTL_SERVER=$FLIGHTCTL_SERVER" >&2
echo "  FLIGHTCTL_CLI_ARTIFACTS_SERVER=${FLIGHTCTL_CLI_ARTIFACTS_SERVER:-'(disabled)'}" >&2
echo "  FLIGHTCTL_ALERTMANAGER_PROXY=${FLIGHTCTL_ALERTMANAGER_PROXY:-'(disabled)'}" >&2
echo >&2
