import { Device, PatchRequest } from '@flightctl/types';
import * as React from 'react';
import { useFetch } from '../../../hooks/useFetch';
import ResourceCatalogPage from '../../Catalog/ResourceCatalog/ResourceCatalogPage';

type DeviceDetailsCatalogProps = {
  device: Device;
  refetch: VoidFunction;
  canEdit: boolean;
};

const DeviceDetailsCatalog = ({ device, refetch, canEdit }: DeviceDetailsCatalogProps) => {
  const { patch } = useFetch();
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
    />
  );
};

export default DeviceDetailsCatalog;
