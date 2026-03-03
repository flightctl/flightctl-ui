import { Device, PatchRequest } from '@flightctl/types';
import * as React from 'react';
import { useFetch } from '../../../hooks/useFetch';
import ResourceCatalogPage from '../../Catalog/ResourceCatalog/ResourceCatalogPage';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';

type DeviceDetailsCatalogProps = {
  device: Device;
  refetch: VoidFunction;
  canEdit: boolean;
};

const DeviceDetailsCatalog = ({ device, refetch, canEdit }: DeviceDetailsCatalogProps) => {
  const { patch } = useFetch();
  const navigate = useNavigate();
  const onPatch = React.useCallback(
    async (allPatches: PatchRequest) => {
      await patch(`devices/${device.metadata.name}`, allPatches);
      refetch();
    },
    [refetch, patch, device.metadata.name],
  );

  return (
    <ResourceCatalogPage
      canEdit={canEdit && !device.metadata.owner}
      currentLabels={device.metadata.labels}
      onPatch={onPatch}
      spec={device.spec}
      specPath="/"
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
