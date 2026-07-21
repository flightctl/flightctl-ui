import { DeviceSpec, PatchRequest } from '@flightctl/types';
import * as React from 'react';
import { Alert, Stack, StackItem } from '@patternfly/react-core';

import { CatalogItem } from '@flightctl/types/alpha';
import { getRemoveAppPatches, getRemoveOsPatches } from '../../Catalog/utils';
import { CatalogPageContent } from '../../Catalog/CatalogPage';
import InstalledSoftware from '../../Catalog/InstalledSoftware';
import { usePermissionsContext } from '../../common/PermissionsContext';
import { RESOURCE, VERB } from '../../../types/rbac';
import PageWithPermissions from '../../common/PageWithPermissions';
import { useTranslation } from '../../../hooks/useTranslation';

import './ResourceCatalogPage.css';

type ResourceCatalogPageProps = {
  specPath: string;
  canEdit: boolean;
  hasOwner?: boolean;
  hasPackageMode?: boolean;
  spec: DeviceSpec | undefined;
  currentLabels: Record<string, string> | undefined;
  onPatch: (allPatches: PatchRequest) => Promise<void>;
  onEdit: (catalogId: string, catalogItemId: string, appName?: string) => void;
  onInstall: (installItem: { item: CatalogItem; channel: string; version: string }) => void;
};

const catalogPagePermissions = [
  { kind: RESOURCE.CATALOG_ITEM, verb: VERB.LIST },
  { kind: RESOURCE.CATALOG, verb: VERB.LIST },
];

const ResourceCatalogPage = ({
  currentLabels,
  spec,
  onPatch,
  specPath,
  canEdit,
  hasPackageMode,
  hasOwner,
  onEdit,
  onInstall,
}: ResourceCatalogPageProps) => {
  const { t } = useTranslation();
  const { checkPermissions, loading } = usePermissionsContext();
  const [canListItems, canListCatalogs] = checkPermissions(catalogPagePermissions);
  const onDeleteOs = async () => {
    const allPatches = getRemoveOsPatches({ currentLabels, specPath });
    await onPatch(allPatches);
  };

  const onDeleteApp = async (appName: string) => {
    const allPatches = getRemoveAppPatches({
      appName,
      currentApps: spec?.applications,
      currentLabels,
      specPath,
    });
    await onPatch(allPatches);
  };

  return (
    <PageWithPermissions allowed={canListItems && canListCatalogs} loading={loading}>
      <Stack hasGutter>
        {hasPackageMode && (
          <StackItem>
            <Alert isInline variant="info" title={t('OS catalog items are not available for package-mode devices')}>
              {t(
                'This device uses traditional package management (dnf/yum). OS image updates do not apply. Use your existing package management tools to manage OS updates on this device.',
              )}
            </Alert>
          </StackItem>
        )}
        <StackItem>
          <InstalledSoftware
            hasPackageMode={hasPackageMode}
            labels={currentLabels}
            spec={spec}
            onDeleteOs={onDeleteOs}
            onEdit={onEdit}
            onDeleteApp={onDeleteApp}
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
