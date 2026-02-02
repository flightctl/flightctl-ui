import { Fleet, PatchRequest } from '@flightctl/types';
import * as React from 'react';
import { useFetch } from '../../../hooks/useFetch';
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
    />
  );
};

export default FleetDetailsCatalog;
