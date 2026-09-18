import { type TFunction } from 'react-i18next';

import { AppType } from '@flightctl/types';
import { type CatalogItemArtifact, CatalogItemArtifactType, CatalogItemType } from '@flightctl/types/alpha';
import type { ArtifactFormValue } from '../components/Catalog/AddCatalogItemWizard/types';

type AppCatalogTypes =
  | CatalogItemType.CatalogItemTypeContainer
  | CatalogItemType.CatalogItemTypeQuadlet
  | CatalogItemType.CatalogItemTypeCompose
  | CatalogItemType.CatalogItemTypeHelm
  | CatalogItemType.CatalogItemTypeData;

type AllCatalogItemTypes = AppCatalogTypes | CatalogItemType.CatalogItemTypeOS;

// Application types that can be used in the UI, for manual applications.
export const manualAppTypeOptions = (t: TFunction): Record<AppType, string> => ({
  [AppType.AppTypeContainer]: t('Single Container application'),
  [AppType.AppTypeQuadlet]: t('Quadlet application'),
  [AppType.AppTypeHelm]: t('Helm application'),
  [AppType.AppTypeCompose]: t('Compose application'),
  [AppType.AppTypeVm]: t('Virtual machine (KVM)'),
});

export const getAppTypeLabel = (appType: AppType, t: TFunction): string => {
  const labels: Record<AppType, string> = {
    [AppType.AppTypeContainer]: t('Single Container'),
    [AppType.AppTypeQuadlet]: t('Quadlet'),
    [AppType.AppTypeCompose]: t('Compose'),
    [AppType.AppTypeHelm]: t('Helm'),
    [AppType.AppTypeVm]: t('VM'),
  };
  return labels[appType] || t('Unknown');
};

// Application types that can be used in the UI, for "catalog" apps (apps themselves, and Data items for app volumes)
export const appAndDataCatalogTypeOptions = (t: TFunction): Record<AppCatalogTypes, string> => ({
  [CatalogItemType.CatalogItemTypeContainer]: t('Container'),
  [CatalogItemType.CatalogItemTypeQuadlet]: t('Quadlet'),
  [CatalogItemType.CatalogItemTypeCompose]: t('Compose'),
  [CatalogItemType.CatalogItemTypeHelm]: t('Helm'),
  [CatalogItemType.CatalogItemTypeData]: t('Data'),
});

// All catalog item types known to the UI.
export const allCatalogTypeOptions = (t: TFunction): Record<AllCatalogItemTypes, string> => ({
  [CatalogItemType.CatalogItemTypeOS]: t('OS image'),
  [CatalogItemType.CatalogItemTypeContainer]: t('Container'),
  [CatalogItemType.CatalogItemTypeQuadlet]: t('Quadlet'),
  [CatalogItemType.CatalogItemTypeHelm]: t('Helm'),
  [CatalogItemType.CatalogItemTypeCompose]: t('Compose'),
  [CatalogItemType.CatalogItemTypeData]: t('Data'),
});

export const getArtifactLabel = (t: TFunction, artifact: ArtifactFormValue | CatalogItemArtifact) => {
  const { type, name } = artifact;
  if (type === '') {
    return name;
  }
  if (name) {
    return `${name} (${type})`;
  }
  switch (type) {
    case CatalogItemArtifactType.CatalogItemArtifactTypeQcow2:
      return t('QCOW2 (qcow2)');
    case CatalogItemArtifactType.CatalogItemArtifactTypeIso:
      return t('Bare Metal (iso)');
    case CatalogItemArtifactType.CatalogItemArtifactTypeAmi:
      return t('Amazon Web Services (ami)');
    case CatalogItemArtifactType.CatalogItemArtifactTypeAnacondaIso:
      return t('Anaconda Installer (anaconda-iso)');
    case CatalogItemArtifactType.CatalogItemArtifactTypeGce:
      return t('Google Cloud (gce)');
    case CatalogItemArtifactType.CatalogItemArtifactTypeRaw:
      return t('KVM/custom cloud import (raw)');
    case CatalogItemArtifactType.CatalogItemArtifactTypeVhd:
      return t('Microsoft Hyper-V (vhd)');
    case CatalogItemArtifactType.CatalogItemArtifactTypeVmdk:
      return t('VMware vSphere (vmdk)');
    case CatalogItemArtifactType.CatalogItemArtifactTypeContainer:
      return t('Cloud native (container)');
    case CatalogItemArtifactType.CatalogItemArtifactTypeQcow2DiskContainer:
      return t('OpenShift Virtualization (qcow2-disk-container)');
    default: {
      return t('Unknown ({{ type }})', { type });
    }
  }
};
