import * as React from 'react';

import type { Fleet, PatchRequest } from '@flightctl/types';
import { useFetch } from '../../../hooks/useFetch';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { RESOURCE, VERB } from '../../../types/rbac';
import { usePermissionsContext } from '../../common/PermissionsContext';
import ResourceCatalogPage from '../../Catalog/ResourceCatalog/ResourceCatalogPage';

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
      canEdit={canEdit && !fleet.metadata.owner}
      hasOwner={!!fleet.metadata.owner}
      onPatch={onPatch}
      spec={fleet.spec.template.spec}
      specPath="/spec/template/"
      onEdit={(id) => {
        let path = `${fleet.metadata.name}/${id.ref.catalog}/${id.ref.item}`;
        if (id.appName) {
          const params = new URLSearchParams({
            appName: id.appName,
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
