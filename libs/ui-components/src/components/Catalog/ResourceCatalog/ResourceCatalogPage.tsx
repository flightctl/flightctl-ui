import { DeviceSpec, PatchRequest } from '@flightctl/types';
import * as React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { CatalogItem } from '@flightctl/types/alpha';

import { getRemoveAppPatches, getRemoveOsPatches } from '../../Catalog/utils';
import { CatalogPageWithInit } from '../../Catalog/CatalogPage';
import InstalledSoftware from '../../Catalog/InstalledSoftware';

import './ResourceCatalogPage.css';

type ResourceCatalogPageProps = {
  specPath: string;
  canEdit: boolean;
  hasOwner?: boolean;
  spec: DeviceSpec | undefined;
  currentLabels: Record<string, string> | undefined;
  onPatch: (allPatches: PatchRequest) => Promise<void>;
  onEdit: (catalogId: string, catalogItemId: string, appName?: string) => void;
  onInstall: (installItem: { item: CatalogItem; channel: string; version: string }) => void;
};

const ResourceCatalogPage = ({
  currentLabels,
  spec,
  onPatch,
  specPath,
  canEdit,
  hasOwner,
  onEdit,
  onInstall,
}: ResourceCatalogPageProps) => {
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
    <>
      <Stack>
        <StackItem>
          <InstalledSoftware
            labels={currentLabels}
            spec={spec}
            onDeleteOs={onDeleteOs}
            onEdit={onEdit}
            onDeleteApp={onDeleteApp}
            canEdit={canEdit}
          />
        </StackItem>
        <StackItem className="fctl-resource-catalog-page">
          <CatalogPageWithInit canInstall={canEdit} targetHasOwner={hasOwner} onInstall={onInstall} targetSet />
        </StackItem>
      </Stack>
    </>
  );
};

export default ResourceCatalogPage;
