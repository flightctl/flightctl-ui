#!/usr/bin/env bash

set -e
QUAY_CHARTS=${QUAY_CHARTS:-quay.io/flightctl/charts}
VERSION=$(git describe --long --tags)
VERSION=${VERSION#v} # remove the leading v prefix for version

echo packaging "${VERSION}"
helm package ./apps/standalone/deploy/helm/flightctl-ui --version "${VERSION}" --app-version "${VERSION}"
helm package ./apps/ocp-plugin/deploy/helm/flightctl-ocp-ui --version "${VERSION}" --app-version "${VERSION}"

#login with helm registry login quay.io -u ${USER} -p ${PASSWORD}
helm push "flightctl-ui-${VERSION}.tgz" oci://${{ env.QUAY_CHARTS }}/
helm push "flightctl-ocp-ui-${VERSION}.tgz" oci://${{ env.QUAY_CHARTS }}/