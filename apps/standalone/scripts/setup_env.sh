#!/usr/bin/env bash

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

# Get the external IP address
EXTERNAL_IP=$(get_external_ip)

if [ -z "$EXTERNAL_IP" ]; then
    echo "Error: Could not determine external IP address" >&2
    exit 1
fi

echo "Using external IP: $EXTERNAL_IP" >&2

# Read configuration flags from environment variables (with defaults)
ENABLE_CLI_ARTIFACTS=${ENABLE_CLI_ARTIFACTS:-false}
ENABLE_ALERTMANAGER=${ENABLE_ALERTMANAGER:-false}
ENABLE_ORGANIZATIONS=${ENABLE_ORGANIZATIONS:-false}

# Set core environment variables for kind development
export FLIGHTCTL_SERVER_INSECURE_SKIP_VERIFY='true'
export FLIGHTCTL_SERVER="https://$EXTERNAL_IP:3443"
export FLIGHTCTL_SERVER_EXTERNAL="https://api.$EXTERNAL_IP.nip.io:3443"


# CLI Artifacts - conditionally set or unset
if [ "$ENABLE_CLI_ARTIFACTS" = "true" ]; then
    export FLIGHTCTL_CLI_ARTIFACTS_SERVER="http://$EXTERNAL_IP:8090"
else
    unset FLIGHTCTL_CLI_ARTIFACTS_SERVER
fi

# AlertManager - conditionally set or unset
if [ "$ENABLE_ALERTMANAGER" = "true" ]; then
    export FLIGHTCTL_ALERTMANAGER_PROXY="https://$EXTERNAL_IP:8443"
else
    unset FLIGHTCTL_ALERTMANAGER_PROXY
fi

# Organizations - conditionally set or unset
if [ "$ENABLE_ORGANIZATIONS" = "true" ]; then
    export ORGANIZATIONS_ENABLED="true"
else
    export ORGANIZATIONS_ENABLED="false"
fi

echo "Environment variables set:" >&2
echo "  FLIGHTCTL_SERVER_INSECURE_SKIP_VERIFY=$FLIGHTCTL_SERVER_INSECURE_SKIP_VERIFY" >&2
echo "  FLIGHTCTL_SERVER=$FLIGHTCTL_SERVER" >&2
echo "  FLIGHTCTL_SERVER_EXTERNAL=$FLIGHTCTL_SERVER_EXTERNAL" >&2
echo "  FLIGHTCTL_CLI_ARTIFACTS_SERVER=${FLIGHTCTL_CLI_ARTIFACTS_SERVER:-'(disabled)'}" >&2
echo "  FLIGHTCTL_ALERTMANAGER_PROXY=${FLIGHTCTL_ALERTMANAGER_PROXY:-'(disabled)'}" >&2
echo "  ORGANIZATIONS_ENABLED=$ORGANIZATIONS_ENABLED" >&2
echo >&2

 