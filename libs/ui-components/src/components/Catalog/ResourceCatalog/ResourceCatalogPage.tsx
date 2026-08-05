import { DeviceSpec, PatchRequest } from '@flightctl/types';
import * as React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';

import { CatalogItem } from '@flightctl/types/alpha';
import { type SpecCatalogItemId, getRemoveAppPatches, getRemoveOsPatches } from '../../../utils/catalog';
import { RESOURCE, VERB } from '../../../types/rbac';
import { usePermissionsContext } from '../../common/PermissionsContext';
import PageWithPermissions from '../../common/PageWithPermissions';
import { CatalogPageContent } from '../../Catalog/CatalogPage';
import InstalledSoftware from '../../Catalog/InstalledSoftware';

import './ResourceCatalogPage.css';

type ResourceCatalogPageProps = {
  specPath: string;
  canEdit: boolean;
  hasOwner?: boolean;
  hasPackageMode?: boolean;
  spec: DeviceSpec | undefined;
  onPatch: (allPatches: PatchRequest) => Promise<void>;
  onEdit: (id: SpecCatalogItemId) => void;
  onInstall: (installItem: { item: CatalogItem; channel: string; version: string }) => void;
};

const catalogPagePermissions = [
  { kind: RESOURCE.CATALOG_ITEM, verb: VERB.LIST },
  { kind: RESOURCE.CATALOG, verb: VERB.LIST },
];

const ResourceCatalogPage = ({
  spec,
  onPatch,
  specPath,
  canEdit,
  hasPackageMode,
  hasOwner,
  onEdit,
  onInstall,
}: ResourceCatalogPageProps) => {
  const { checkPermissions, loading } = usePermissionsContext();
  const [canListItems, canListCatalogs] = checkPermissions(catalogPagePermissions);

  const onDeleteItem = async (id: SpecCatalogItemId) => {
    let allPatches: PatchRequest = [];
    if (id.type === 'os') {
      allPatches = getRemoveOsPatches({ specPath });
    } else if (id.type === 'app') {
      allPatches = getRemoveAppPatches({
        appName: id.appName as string,
        currentApps: spec?.applications,
        specPath,
      });
    }
    if (allPatches.length > 0) {
      await onPatch(allPatches);
    }
  };

  return (
    <PageWithPermissions allowed={canListItems && canListCatalogs} loading={loading}>
      <Stack hasGutter>
        <StackItem>
          <InstalledSoftware
            hasPackageMode={hasPackageMode}
            onDeleteItem={onDeleteItem}
            onEdit={onEdit}
            canEdit={canEdit}
          />
        </StackItem>
        <StackItem className="fctl-resource-catalog-page">
          <CatalogPageContent
            canInstall={canEdit}
            targetHasOwner={hasOwner}
            targetHasPackageMode={hasPackageMode}
            onInstall={onInstall}
            targetSet
          />
        </StackItem>
      </Stack>
    </PageWithPermissions>
  );
};

export default ResourceCatalogPage;
