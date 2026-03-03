import { Fleet, PatchRequest } from '@flightctl/types';
import * as React from 'react';
import { useFetch } from '../../../hooks/useFetch';
import { RESOURCE, VERB } from '../../../types/rbac';
import { usePermissionsContext } from '../../common/PermissionsContext';
import ResourceCatalogPage from '../../Catalog/ResourceCatalog/ResourceCatalogPage';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';

type FleetDetailsCatalogProps = {
  fleet: Fleet;
  refetch: VoidFunction;
};

const fleetCatalogPermissions = [{ kind: RESOURCE.FLEET, verb: VERB.PATCH }];

const FleetDetailsCatalog = ({ fleet, refetch }: FleetDetailsCatalogProps) => {
  const { patch } = useFetch();
  const navigate = useNavigate();
  const { checkPermissions } = usePermissionsContext();
  const [canEdit] = checkPermissions(fleetCatalogPermissions);
  const onPatch = React.useCallback(
    async (allPatches: PatchRequest) => {
      await patch(`fleets/${fleet.metadata.name}`, allPatches);
      refetch();
    },
    [fleet.metadata.name, patch, refetch],
  );

  return (
    <ResourceCatalogPage
      canEdit={canEdit}
      currentLabels={fleet.metadata.labels}
      onPatch={onPatch}
      spec={fleet.spec.template.spec}
      specPath="/spec/template/"
      onEdit={(catalogId, catalogItemId, appName) => {
        let path = `${fleet.metadata.name}/${catalogId}/${catalogItemId}`;
        if (appName) {
          const params = new URLSearchParams({
            appName,
          });
          path = `${path}?${params.toString()}`;
        }
        navigate({
          route: ROUTE.CATALOG_FLEET_EDIT,
          postfix: path,
        });
      }}
      onInstall={({ item, version, channel }) => {
        const params = new URLSearchParams({
          version,
          channel,
        });

        const path = `${fleet.metadata.name}/${item.metadata.catalog}/${item.metadata.name}?${params.toString()}`;
        navigate({
          route: ROUTE.CATALOG_FLEET_EDIT,
          postfix: path,
        });
      }}
    />
  );
};

export default FleetDetailsCatalog;
