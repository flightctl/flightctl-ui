import * as React from 'react';
import { Alert, Spinner } from '@patternfly/react-core';

import type { Device, PatchRequest } from '@flightctl/types';
import { useFetch } from '../../../hooks/useFetch';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDeviceOwnerFleet } from '../../../hooks/useDeviceOwnerFleet';
import { getErrorMessage } from '../../../utils/error';
import { hasPackageModeCapability } from '../../../utils/capabilities';
import ResourceCatalogPage from '../../Catalog/ResourceCatalog/ResourceCatalogPage';

type DeviceDetailsCatalogProps = {
  device: Device;
  refetch: VoidFunction;
  canEdit: boolean;
};

const DeviceDetailsCatalog = ({ device, refetch, canEdit }: DeviceDetailsCatalogProps) => {
  const { patch } = useFetch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onPatch = React.useCallback(
    async (allPatches: PatchRequest) => {
      await patch(`devices/${device.metadata.name}`, allPatches);
      refetch();
    },
    [refetch, patch, device.metadata.name],
  );

  const [hasOwnerFleet, ownerFleet, ownerFleetLoading, ownerFleetError] = useDeviceOwnerFleet(device.metadata.owner);

  if (ownerFleetLoading) {
    return <Spinner />;
  }
  if (ownerFleetError) {
    return (
      <Alert isInline variant="danger" title={t('Failed to fetch owner fleet')}>
        {getErrorMessage(ownerFleetError)}
      </Alert>
    );
  }

  const hasPackageMode = hasPackageModeCapability(device);

  return hasOwnerFleet ? (
    <ResourceCatalogPage
      canEdit={false}
      hasOwner
      hasPackageMode={hasPackageMode}
      currentLabels={ownerFleet?.metadata?.labels}
      onPatch={async () => {}}
      spec={ownerFleet?.spec.template.spec}
      specPath="/spec/template"
      onEdit={() => {}}
      onInstall={() => {}}
    />
  ) : (
    <ResourceCatalogPage
      canEdit={canEdit}
      currentLabels={device.metadata.labels}
      onPatch={onPatch}
      spec={device.spec}
      specPath="/"
      hasPackageMode={hasPackageMode}
      onEdit={(catalogId, catalogItemId, appName) => {
        let path = `${device.metadata.name}/${catalogId}/${catalogItemId}`;
        if (appName) {
          const params = new URLSearchParams({
            appName,
          });
          path = `${path}?${params.toString()}`;
        }
        navigate({
          route: ROUTE.CATALOG_DEVICE_EDIT,
          postfix: path,
        });
      }}
      onInstall={({ item, version, channel }) => {
        const params = new URLSearchParams({
          version,
          channel,
        });

        const path = `${device.metadata.name}/${item.metadata.catalog}/${item.metadata.name}?${params.toString()}`;
        navigate({
          route: ROUTE.CATALOG_DEVICE_EDIT,
          postfix: path,
        });
      }}
    />
  );
};

export default DeviceDetailsCatalog;
