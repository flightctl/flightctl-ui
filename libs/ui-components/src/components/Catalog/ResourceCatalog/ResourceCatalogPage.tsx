import { DeviceSpec, PatchRequest } from '@flightctl/types';
import * as React from 'react';
import { load } from 'js-yaml';
import { Stack, StackItem } from '@patternfly/react-core';

import { CatalogItem, CatalogItemCategory, CatalogItemVersion } from '@flightctl/types/alpha';
import { getAppPatches, getOsPatches, getRemoveAppPatches, getRemoveOsPatches } from '../../Catalog/utils';
import EditAppModal, { AppUpdateFormik } from '../../Catalog/UpdateModal/EditAppModal';
import EditOsModal from '../../Catalog/UpdateModal/EditOsModal';
import { CatalogPageContent } from '../../Catalog/CatalogPage';
import InstalledSoftware from '../../Catalog/InstalledSoftware';

type ResourceCatalogPageProps = {
  specPath: string;
  canEdit: boolean;
  spec: DeviceSpec | undefined;
  currentLabels: Record<string, string> | undefined;
  onPatch: (allPatches: PatchRequest) => Promise<void>;
};

const ResourceCatalogPage = ({ currentLabels, spec, onPatch, specPath, canEdit }: ResourceCatalogPageProps) => {
  const [selectedItem, setSelectedItem] = React.useState<{ itemName: string; catalog: string }>();
  const [installItem, setInstallItem] = React.useState<{ item: CatalogItem; channel: string; version: string }>();

  const onUpdateOs = async (catalogItem: CatalogItem, version: string, channel: string) => {
    const catalogItemVersion = catalogItem.spec.versions.find(
      ({ version: v, channels }) => v === version && channels.includes(channel),
    );
    if (catalogItemVersion) {
      const allPatches = getOsPatches({
        currentOsImage: spec?.os?.image,
        currentLabels,
        catalogItem,
        catalogItemVersion,
        channel,
        specPath,
      });
      await onPatch(allPatches);
    }
  };

  const onUpdateApp = async (catalogItem: CatalogItem, version: string, channel: string, values: AppUpdateFormik) => {
    const catalogItemVersion = catalogItem.spec.versions.find(
      ({ version: v, channels }) => v === version && channels.includes(channel),
    );
    if (catalogItemVersion) {
      const allPatches = getAppPatches({
        appName: values.appName,
        catalogItem,
        catalogItemVersion,
        channel,
        specPath,
        currentApps: spec?.applications,
        currentLabels,
        formValues:
          values.configureVia === 'form' ? values.formValues : (load(values.editorContent) as Record<string, unknown>),
        selectedAssets: values.selectedAssets,
      });
      await onPatch(allPatches);
    }
  };

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
            onUpdateOs={onUpdateOs}
            onDeleteOs={onDeleteOs}
            onUpdateApp={onUpdateApp}
            onDeleteApp={onDeleteApp}
            canEdit={canEdit}
          />
        </StackItem>
        <StackItem style={{ marginTop: 'var(--pf-t--global--spacer--4xl)' }}>
          <CatalogPageContent
            canInstall={canEdit}
            onInstall={setInstallItem}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          />
        </StackItem>
      </Stack>
      {installItem?.item.spec.category === CatalogItemCategory.CatalogItemCategoryApplication && (
        <EditAppModal
          currentApps={spec?.applications}
          catalogItem={installItem.item}
          currentChannel={installItem.channel}
          exisingLabels={currentLabels}
          onClose={() => setInstallItem(undefined)}
          onSubmit={async (catalogItem, version, channel, values) => {
            await onUpdateApp(catalogItem, version, channel, values);
            setSelectedItem(undefined);
          }}
          currentVersion={
            installItem.item.spec.versions.find((v) => v.version === installItem.version) as CatalogItemVersion
          }
        />
      )}
      {installItem?.item.spec.category === CatalogItemCategory.CatalogItemCategorySystem && (
        <EditOsModal
          onClose={() => setInstallItem(undefined)}
          item={installItem.item}
          onSubmit={async () => {
            await onUpdateOs(installItem.item, installItem.version, installItem.channel);
            setSelectedItem(undefined);
          }}
        />
      )}
    </>
  );
};

export default ResourceCatalogPage;
