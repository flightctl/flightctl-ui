import * as React from 'react';
import { type Device, type Fleet, OsModeType, type PatchRequest } from '@flightctl/types';
import { Stack, StackItem } from '@patternfly/react-core';

import type { CatalogItem } from '@flightctl/types/alpha';
import { type SpecCatalogItemId, getRemoveAppPatches, getRemoveOsPatches } from '../../../utils/catalog';
import { RESOURCE, VERB } from '../../../types/rbac';
import { usePermissionsContext } from '../../common/PermissionsContext';
import PageWithPermissions from '../../common/PageWithPermissions';
import { CatalogPageContent } from '../../Catalog/CatalogPage';
import InstalledSoftware from '../../Catalog/InstalledSoftware';
import { type CatalogEditWizardMode } from '../../../utils/catalog';

import './ResourceCatalogPage.css';

type ResourceCatalogPageProps = {
  canEdit: boolean;
  targetDevice?: Device;
  targetFleet?: Fleet;
  onPatch: (allPatches: PatchRequest) => Promise<void>;
  onEdit: (id: SpecCatalogItemId, mode: CatalogEditWizardMode) => void;
  onInstall: (installItem: { item: CatalogItem; channel: string; version: string }) => void;
};

const catalogPagePermissions = [
  { kind: RESOURCE.CATALOG_ITEM, verb: VERB.LIST },
  { kind: RESOURCE.CATALOG, verb: VERB.LIST },
];

const ResourceCatalogPage = ({
  targetFleet,
  targetDevice,
  onPatch,
  canEdit,
  onEdit,
  onInstall,
}: ResourceCatalogPageProps) => {
  const { checkPermissions, loading } = usePermissionsContext();
  const [canListItems, canListCatalogs] = checkPermissions(catalogPagePermissions);

  const hasPackageMode = targetDevice?.status?.systemInfo?.osMode === OsModeType.OsModePackage;

  const onDeleteItem = async (id: SpecCatalogItemId) => {
    const specPath = Boolean(targetFleet) ? '/spec/template/' : '/';
    let allPatches: PatchRequest = [];
    if (id.type === 'os') {
      allPatches = getRemoveOsPatches({ specPath });
    } else if (id.type === 'app') {
      const spec = targetFleet?.spec.template.spec || targetDevice?.spec;
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
            targetFleet={targetFleet}
            targetDevice={targetDevice}
            canInstall={canEdit}
            onInstall={onInstall}
          />
        </StackItem>
      </Stack>
    </PageWithPermissions>
  );
};

export default ResourceCatalogPage;
