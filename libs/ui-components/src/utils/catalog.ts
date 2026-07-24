import {
  AppType,
  type ApplicationProviderSpec,
  type ApplicationVolume,
  type CatalogItemRefSpec,
  type DeviceSpec,
  type ImageMountVolumeProviderSpec,
  type ImageOrCatalogItemRefSpec,
  ImagePullPolicy,
  type PatchRequest,
} from '@flightctl/types';
import {
  CatalogItem,
  type CatalogItemArtifact,
  CatalogItemArtifactType,
  CatalogItemCategory,
  CatalogItemType,
  type CatalogItemVersion,
} from '@flightctl/types/alpha';

import { TFunction } from 'i18next';
import semver from 'semver';

import { CatalogVolumSelection } from '../components/DynamicForm/DynamicForm';
import type { ArtifactFormValue } from '../components/Catalog/AddCatalogItemWizard/types';
import { type ApplicationVolumeForm, formVolumesToApi } from './volumes';

import appIcon from '../../assets/application.svg';
import osIcon from '../../assets/os.svg';

export type CatalogItemId = { catalog: string; item: string };

export type ResolvedCatalogRef = {
  item: CatalogItem;
  displayName: string;
  version: CatalogItemVersion | undefined;
  channel: string;
  imageUri?: string;
};

export const getAppCatalogItemRef = (app: ApplicationProviderSpec): CatalogItemRefSpec | undefined =>
  'catalogItemRef' in app ? app.catalogItemRef : undefined;

export const isCatalogRef = (value: unknown): value is CatalogItemRefSpec =>
  typeof value === 'object' && value !== null && 'catalogItemRef' in value && Boolean(value.catalogItemRef);

export const catalogItemCacheKey = (id: CatalogItemId): string => `${id.catalog}\0${id.item}`;

export const formatCatalogItemRef = (ref: CatalogItemRefSpec): string => `${ref.catalog}/${ref.item}:${ref.version}`;

export const toCatalogItemId = (ref: Pick<CatalogItemRefSpec, 'catalog' | 'item'>): CatalogItemId => ({
  catalog: ref.catalog,
  item: ref.item,
});

export const extractCatalogItemIdsFromSpec = (spec: DeviceSpec | undefined): CatalogItemId[] => {
  const byKey = new Map<string, CatalogItemId>();
  const addRef = (ref: CatalogItemRefSpec | undefined) => {
    if (!ref) {
      return;
    }
    const id = toCatalogItemId(ref);
    byKey.set(catalogItemCacheKey(id), id);
  };

  if (spec?.os?.catalogItemRef) {
    addRef(spec.os.catalogItemRef);
  }
  (spec?.applications || []).forEach((app) => {
    addRef(getAppCatalogItemRef(app));
    const volumes = 'volumes' in app ? (app.volumes as ImageMountVolumeProviderSpec[]) : undefined;
    if (volumes) {
      volumes.forEach((vol) => {
        addRef(vol.image?.catalogItemRef);
      });
    }
  });
  return [...byKey.values()];
};

export const getCurrentVersion = (
  catalogItem: CatalogItem,
  version: string | undefined,
  catalogRef: CatalogItemRefSpec | undefined,
) => {
  const matchingVersion = version || catalogRef?.version;
  return catalogItem.spec.versions.find((v) => v.version === matchingVersion);
};

export const buildCatalogItemRef = ({
  catalogItem,
  catalogItemVersion,
  channel,
}: {
  catalogItem: CatalogItem;
  catalogItemVersion: CatalogItemVersion;
  channel: string;
}): CatalogItemRefSpec => {
  const ref: CatalogItemRefSpec = {
    catalog: catalogItem.metadata.catalog,
    item: catalogItem.metadata.name || '',
    version: catalogItemVersion.version,
  };
  if (channel) {
    ref.channel = channel;
  }
  return ref;
};

const tagRegex = /^[\w][\w.-]{0,127}$/;

export const getFullArtifactURI = (artifact: CatalogItemArtifact, version: CatalogItemVersion) => {
  const versionRef = version.references[artifact.type];
  if (!versionRef) {
    return undefined;
  }

  // tag, nor digest can contain '/'
  if (versionRef.includes('/')) {
    return versionRef;
  }

  if (tagRegex.test(versionRef)) {
    return `${artifact.uri}:${versionRef}`;
  }

  return `${artifact.uri}@${versionRef}`;
};

export const getFullContainerURI = (artifacts: CatalogItemArtifact[], version: CatalogItemVersion) => {
  const containerArtifact = artifacts.find((a) => a.type === CatalogItemArtifactType.CatalogItemArtifactTypeContainer);
  if (!containerArtifact) {
    return undefined;
  }

  return getFullArtifactURI(containerArtifact, version);
};

export const resolveCatalogRef = (item: CatalogItem, ref: CatalogItemRefSpec): ResolvedCatalogRef => {
  const version = getCurrentVersion(item, ref.version, ref);
  const displayName = item.spec.displayName || item.metadata.name || ref.item;
  const imageUri = version ? getFullContainerURI(item.spec.artifacts, version) : undefined;
  return {
    item,
    displayName,
    version,
    channel: ref.channel || '',
    imageUri,
  };
};

export const getCatalogItemBadge = (itemType: CatalogItemType | undefined, t: TFunction) => {
  switch (itemType) {
    case CatalogItemType.CatalogItemTypeCompose: {
      return t('Compose');
    }
    case CatalogItemType.CatalogItemTypeContainer: {
      return t('Container');
    }
    case CatalogItemType.CatalogItemTypeData: {
      return t('Data');
    }
    case CatalogItemType.CatalogItemTypeHelm: {
      return t('Helm');
    }
    case CatalogItemType.CatalogItemTypeQuadlet: {
      return t('Quadlet');
    }
    case CatalogItemType.CatalogItemTypeOS: {
      return t('OS image');
    }
    default: {
      return t('Unknown');
    }
  }
};

export const getRemoveOsPatches = ({ specPath }: { specPath: string }) => {
  const allPatches: PatchRequest = [];
  allPatches.push({
    path: `${specPath}spec/os`,
    op: 'remove',
  });
  return allPatches;
};

export const getRemoveAppPatches = ({
  appName,
  specPath,
  currentApps,
}: {
  appName: string;
  specPath: string;
  currentApps: ApplicationProviderSpec[] | undefined;
}) => {
  const allPatches: PatchRequest = [];
  const appIndex = currentApps?.findIndex((a) => a.name === appName);

  if (currentApps?.length && appIndex !== -1) {
    allPatches.push({
      path: `${specPath}spec/applications/${appIndex}`,
      op: 'remove',
    });
  }

  return allPatches;
};

const getAppType = (catalogItem: CatalogItem): AppType | undefined => {
  switch (catalogItem.spec.type) {
    case CatalogItemType.CatalogItemTypeCompose:
      return AppType.AppTypeCompose;
    case CatalogItemType.CatalogItemTypeQuadlet:
      return AppType.AppTypeQuadlet;
    case CatalogItemType.CatalogItemTypeHelm:
      return AppType.AppTypeHelm;
    case CatalogItemType.CatalogItemTypeContainer:
      return AppType.AppTypeContainer;
    default:
      return undefined;
  }
};

// Combines the form volumes with their selected Data catalog assets.
const combineFormVolumeWithSelection = (
  volumes: ApplicationVolumeForm[] | undefined,
  volumeSelection: CatalogVolumSelection[],
): ApplicationVolumeForm[] => {
  if (!volumes?.length) {
    return [];
  }

  return volumes.map((vol, idx) => {
    const selectedVolume = volumeSelection.find((a) => a.volumeIndex === idx);
    const imageSpec: ImageOrCatalogItemRefSpec = selectedVolume?.catalogItemRef
      ? {
          catalogItemRef: selectedVolume.catalogItemRef,
        }
      : {
          image: vol.imageSpec.image,
        };
    return {
      name: vol.name,
      imageSpec,
      imagePullPolicy: vol?.imagePullPolicy || ImagePullPolicy.PullIfNotPresent,
      mountPath: vol.mountPath,
    };
  });
};

export const getAppPatches = ({
  appName,
  currentApps,
  catalogItem,
  catalogItemVersion,
  channel,
  formValues,
  specPath,
  volumeSelection,
}: {
  appName: string;
  currentApps: ApplicationProviderSpec[] | undefined;
  catalogItem: CatalogItem;
  catalogItemVersion: CatalogItemVersion;
  channel: string;
  formValues: Record<string, unknown> | undefined;
  specPath: string;
  volumeSelection: CatalogVolumSelection[];
}) => {
  const appType = getAppType(catalogItem);
  if (!appType) {
    throw new Error('Unknown application type');
  }

  // Separate the volumes since they need to be transformed to API volumes first
  const { volumes: rawVolumes, ...appFormValues } = formValues || {};
  const formVolumes = Array.isArray(rawVolumes) ? [...(rawVolumes as ApplicationVolumeForm[])] : undefined;

  const appSpec: ApplicationProviderSpec = {
    ...appFormValues,
    name: appName,
    appType,
    catalogItemRef: buildCatalogItemRef({ catalogItem, catalogItemVersion, channel }),
    // Explicitly clear image since the catalog item ref will be used instead
    image: undefined,
  };

  const volumes = combineFormVolumeWithSelection(formVolumes, volumeSelection);
  if (volumes.length > 0) {
    (appSpec as { volumes?: ApplicationVolume[] }).volumes = formVolumesToApi(volumes, appType);
  }

  const existingAppIndex = currentApps?.findIndex((app) => app.name === appSpec.name);

  const allPatches: PatchRequest = [];
  if (!currentApps) {
    allPatches.push({
      path: `${specPath}spec/applications`,
      op: 'add',
      value: [appSpec],
    });
  } else if (existingAppIndex === -1) {
    allPatches.push({
      path: `${specPath}spec/applications/-`,
      op: 'add',
      value: appSpec,
    });
  } else {
    allPatches.push({
      path: `${specPath}spec/applications/${existingAppIndex}`,
      op: 'replace',
      value: appSpec,
    });
  }

  return allPatches;
};

export const getUpdates = (catalogItem: CatalogItem, currentChannel: string, currentVersion: string) => {
  const updateVersions = catalogItem.spec.versions.filter((version) => {
    if (!version.channels.includes(currentChannel)) return false;

    // Check if current version can upgrade to this version via:
    // 1. replaces - direct replacement (now a single string)
    if (version.replaces === currentVersion) return true;

    // 2. skips - array of specific versions that can be skipped
    if (version.skips?.includes(currentVersion)) return true;

    // 3. skipRange - semver range check
    if (version.skipRange && semver.satisfies(currentVersion, version.skipRange, { includePrerelease: true })) {
      return true;
    }

    return false;
  });

  // only versions which have container
  return updateVersions.filter((v) => !!getFullContainerURI(catalogItem.spec.artifacts, v));
};

export const getCatalogItemIcon = (catalogItem: CatalogItem): string =>
  catalogItem.spec.icon ||
  ((catalogItem.spec.category === CatalogItemCategory.CatalogItemCategorySystem ? osIcon : appIcon) as string);

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
