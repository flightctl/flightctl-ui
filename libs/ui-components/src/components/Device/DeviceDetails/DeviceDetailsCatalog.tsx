import { Device, Fleet, PatchRequest } from '@flightctl/types';
import * as React from 'react';
import { Alert, Spinner } from '@patternfly/react-core';

import { useFetch } from '../../../hooks/useFetch';
import ResourceCatalogPage from '../../Catalog/ResourceCatalog/ResourceCatalogPage';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { getErrorMessage } from '../../..//utils/error';
import { useTranslation } from '../../../hooks/useTranslation';

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

  const [ownerFleet, loading, error] = useFetchPeriodically<Fleet>({
    endpoint: device.metadata.owner ? `fleets/${device.metadata.owner.split('/')[1]}` : '',
  });

  if (loading) {
    return <Spinner />;
  }
  if (error) {
    return (
      <Alert isInline variant="danger" title={t('Failed to fetch owner fleet')}>
        {getErrorMessage(error)}
      </Alert>
    );
  }

  return device.metadata.owner ? (
    <ResourceCatalogPage
      canEdit={false}
      hasOwner
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
