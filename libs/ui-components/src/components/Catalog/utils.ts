import { AppType, ApplicationProviderSpec, ContainerApplication, PatchRequest } from '@flightctl/types';
import { CatalogItem, CatalogItemCategory, CatalogItemType, CatalogItemVersion } from '@flightctl/types/alpha';
import { TFunction } from 'i18next';
import semver from 'semver';

import { appendJSONPatch, getLabelPatches } from '../../utils/patch';
import {
  APP_CATALOG_LABEL_KEY,
  APP_CHANNEL_LABEL_KEY,
  APP_ITEM_LABEL_KEY,
  APP_VOLUME_CATALOG_LABEL_KEY,
  APP_VOLUME_CHANNEL_LABEL_KEY,
  APP_VOLUME_ITEM_LABEL_KEY,
  OS_CATALOG_LABEL_KEY,
  OS_CHANNEL_LABEL_KEY,
  OS_ITEM_LABEL_KEY,
  getAppVolumeName,
} from './const';
import { fromAPILabel } from '../../utils/labels';
import { AssetSelection } from '../DynamicForm/DynamicForm';

import defaultIcon from '../../../assets/flight-control-logo.png';

export const getFullReferenceURI = (refURI: string, version: CatalogItemVersion) => {
  if (version.digest) {
    return `${refURI}@${version.digest}`;
  }
  if (version.tag) {
    return `${refURI}:${version.tag}`;
  }
  return `${refURI}@${version.version}`;
};

export const getCatalogItemTitles = (category: CatalogItemCategory | undefined, t: TFunction) => {
  switch (category) {
    case CatalogItemCategory.CatalogItemCategoryApplication: {
      return t('Application');
    }
    case CatalogItemCategory.CatalogItemCategorySystem: {
      return t('System');
    }
    default: {
      return t('Unknown');
    }
  }
};

export const getRemoveOsPatches = ({
  specPath,
  currentLabels,
}: {
  specPath: string;
  currentLabels: Record<string, string> | undefined;
}) => {
  const allPatches: PatchRequest = [];
  allPatches.push({
    path: `${specPath}spec/os`,
    op: 'remove',
  });

  const newLabels = currentLabels
    ? {
        ...currentLabels,
      }
    : {};
  delete newLabels[OS_ITEM_LABEL_KEY];
  delete newLabels[OS_CHANNEL_LABEL_KEY];
  delete newLabels[OS_CATALOG_LABEL_KEY];
  const labelPatches = getLabelPatches('/metadata/labels', currentLabels || {}, fromAPILabel(newLabels));

  if (labelPatches.length) {
    allPatches.push(...labelPatches);
  }

  return allPatches;
};

const removeAppLabels = (currentLabels: Record<string, string>, appName: string) => {
  const apiLabels = fromAPILabel(currentLabels);
  const newLabels = apiLabels.filter(({ key }) => {
    return (
      ![
        `${appName}.${APP_ITEM_LABEL_KEY}`,
        `${appName}.${APP_CHANNEL_LABEL_KEY}`,
        `${appName}.${APP_CATALOG_LABEL_KEY}`,
      ].includes(key) &&
      !(
        key.startsWith(`${appName}.`) &&
        (key.endsWith(`.${APP_VOLUME_ITEM_LABEL_KEY}`) ||
          key.endsWith(`.${APP_VOLUME_CATALOG_LABEL_KEY}`) ||
          key.endsWith(`.${APP_VOLUME_CHANNEL_LABEL_KEY}`))
      )
    );
  });
  return newLabels;
};

export const getRemoveAppPatches = ({
  appName,
  specPath,
  currentLabels,
  currentApps,
}: {
  appName: string;
  specPath: string;
  currentLabels: Record<string, string> | undefined;
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

  if (currentLabels) {
    const newLabels = removeAppLabels(currentLabels, appName);
    const labelPatches = getLabelPatches('/metadata/labels', currentLabels || {}, newLabels);

    if (labelPatches.length) {
      allPatches.push(...labelPatches);
    }
  }

  return allPatches;
};

export const getOsPatches = ({
  currentOsImage,
  currentLabels,
  catalogItem,
  catalogItemVersion,
  channel,
  specPath,
}: {
  currentOsImage: string | undefined;
  currentLabels: Record<string, string> | undefined;
  catalogItem: CatalogItem;
  catalogItemVersion: CatalogItemVersion;
  channel: string;
  specPath: string;
}) => {
  const allPatches: PatchRequest = [];
  const newOsImage = getFullReferenceURI(catalogItem.spec.reference.uri, catalogItemVersion);
  if (!currentOsImage && newOsImage) {
    allPatches.push({
      path: `${specPath}spec/os`,
      op: 'add',
      value: { image: newOsImage },
    });
  } else if (!newOsImage && currentOsImage) {
    allPatches.push({
      path: `${specPath}spec/os`,
      op: 'remove',
    });
  } else if (newOsImage && currentOsImage !== newOsImage) {
    appendJSONPatch({
      path: `${specPath}spec/os/image`,
      patches: allPatches,
      newValue: newOsImage,
      originalValue: currentOsImage,
    });
  }

  const newLabels = fromAPILabel({
    ...(currentLabels || {}),
    [OS_CHANNEL_LABEL_KEY]: channel,
    [OS_CATALOG_LABEL_KEY]: catalogItem.metadata.catalog,
    [OS_ITEM_LABEL_KEY]: catalogItem.metadata.name || '',
  });

  const labelPatches = getLabelPatches('/metadata/labels', currentLabels || {}, newLabels);

  if (labelPatches.length) {
    allPatches.push(...labelPatches);
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

export const getAppPatches = ({
  appName,
  currentApps,
  currentLabels,
  catalogItem,
  catalogItemVersion,
  channel,
  formValues,
  specPath,
  selectedAssets,
}: {
  appName: string;
  currentApps: ApplicationProviderSpec[] | undefined;
  currentLabels: Record<string, string> | undefined;
  catalogItem: CatalogItem;
  catalogItemVersion: CatalogItemVersion;
  channel: string;
  formValues: Record<string, unknown> | undefined;
  specPath: string;
  selectedAssets: AssetSelection[];
}) => {
  const allPatches: PatchRequest = [];

  const appType = getAppType(catalogItem);
  if (!appType) {
    throw new Error('Unknown application type');
  }

  const appSpec: ApplicationProviderSpec = {
    ...formValues,
    name: appName,
    appType,
    image: getFullReferenceURI(catalogItem.spec.reference.uri, catalogItemVersion),
  };
  const existingAppIndex = currentApps?.findIndex((app) => app.name === appSpec.name);

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

  const volumeLabels = selectedAssets.reduce((acc, { assetChannel, assetItemName, assetCatalog, volumeIndex }) => {
    const volumes = (appSpec as ContainerApplication).volumes;
    if (!volumes || volumes.length <= volumeIndex) {
      return acc;
    }
    const volumeName = volumes[volumeIndex].name;

    return {
      ...acc,
      [`${getAppVolumeName(appSpec.name, volumeName, APP_VOLUME_ITEM_LABEL_KEY)}`]: assetItemName,
      [`${getAppVolumeName(appSpec.name, volumeName, APP_VOLUME_CHANNEL_LABEL_KEY)}`]: assetChannel,
      [`${getAppVolumeName(appSpec.name, volumeName, APP_VOLUME_CATALOG_LABEL_KEY)}`]: assetCatalog,
    };
  }, {});

  const newLabels = removeAppLabels(currentLabels || {}, appName);
  const appLabels = fromAPILabel({
    [`${appSpec.name}.${APP_CHANNEL_LABEL_KEY}`]: channel,
    [`${appSpec.name}.${APP_CATALOG_LABEL_KEY}`]: catalogItem.metadata.catalog,
    [`${appSpec.name}.${APP_ITEM_LABEL_KEY}`]: catalogItem.metadata.name || '',
    ...volumeLabels,
  });

  newLabels.push(...appLabels);

  const labelPatches = getLabelPatches('/metadata/labels', currentLabels || {}, newLabels);

  if (labelPatches.length) {
    allPatches.push(...labelPatches);
  }

  return allPatches;
};

export const getUpdates = (catalogItem: CatalogItem, currentChannel: string, currentVersion: string) => {
  return catalogItem.spec.versions.filter((version) => {
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
};

export const getCatalogItemIcon = (catalogItem: CatalogItem): string =>
  catalogItem.spec.icon || (defaultIcon as string);
