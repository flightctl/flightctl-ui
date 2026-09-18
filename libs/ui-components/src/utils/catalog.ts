import {
  AppType,
  type ApplicationProviderSpec,
  type ApplicationVolume,
  type CatalogItemRefSpec,
  type DeviceSpec,
  type ImageMountVolumeProviderSpec,
  type PatchRequest,
} from '@flightctl/types';
import {
  type CatalogItem,
  type CatalogItemArtifact,
  CatalogItemArtifactType,
  CatalogItemType,
  type CatalogItemVersion,
} from '@flightctl/types/alpha';

import semver from 'semver';

import { type FullAppVolume, buildApiVolume } from './volumes';
import { RUN_AS_ROOT_USER, isComposeAppSpec, isContainerAppSpec, isQuadletAppSpec } from '../types/deviceSpec';

export type CatalogItemId = { catalog: string; item: string };

/** Role of a catalog item reference on a Device/Fleet template spec. `data` is volume image refs. */
export type SpecCatalogItemType = 'os' | 'app' | 'data';

export type SpecCatalogItemId = {
  type: SpecCatalogItemType;
  ref: CatalogItemRefSpec;
  /** Set for application refs and volume (data) refs under an application. */
  appName?: string;
};

export type ResolvedCatalogRef = {
  item: CatalogItem;
  displayName: string;
  version: CatalogItemVersion | undefined;
  channel: string;
  imageUri?: string;
};

export type CatalogEditWizardMode = 'edit' | 'update';

export const getEditWizardMode = (modeParam: string): CatalogEditWizardMode =>
  modeParam === 'update' ? modeParam : 'edit';

export const getAppCatalogItemRef = (app: ApplicationProviderSpec): CatalogItemRefSpec | undefined =>
  'catalogItemRef' in app ? app.catalogItemRef : undefined;

export const catalogItemCacheKey = (id: CatalogItemId): string => `${id.catalog}\0${id.item}`;

export const formatCatalogItemRef = (ref: CatalogItemRefSpec): string => `${ref.catalog}/${ref.item}:${ref.version}`;

export const toCatalogItemId = (ref: Pick<CatalogItemRefSpec, 'catalog' | 'item'>): CatalogItemId => ({
  catalog: ref.catalog,
  item: ref.item,
});

/**
 * Extracts typed catalog item refs from a Device/Fleet template spec.
 * `data` entries are volume image catalog refs.
 */
export const extractSpecCatalogItemIds = (spec: DeviceSpec | undefined): SpecCatalogItemId[] => {
  const entries: SpecCatalogItemId[] = [];

  if (spec?.os?.catalogItemRef) {
    entries.push({ type: 'os', ref: spec.os.catalogItemRef });
  }

  (spec?.applications || []).forEach((app) => {
    const appRef = getAppCatalogItemRef(app);
    if (appRef && app.name) {
      entries.push({
        type: 'app',
        ref: appRef,
        appName: app.name,
      });
    }

    const volumes = 'volumes' in app ? (app.volumes as ImageMountVolumeProviderSpec[]) : undefined;
    volumes?.forEach((vol) => {
      const volRef = vol.image?.catalogItemRef;
      if (!volRef) {
        return;
      }
      entries.push({
        type: 'data',
        ref: volRef,
        appName: app.name,
      });
    });
  });

  return entries;
};

/** Deduped catalog/item ids for fetch (os, apps, and volume data refs). */
export const extractCatalogItemIdsFromSpec = (spec: DeviceSpec | undefined): CatalogItemId[] => {
  const byKey = new Map<string, CatalogItemId>();
  extractSpecCatalogItemIds(spec).forEach((entry) => {
    const id = toCatalogItemId(entry.ref);
    byKey.set(catalogItemCacheKey(id), id);
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

export const getCatalogRefDisplayName = (
  ref: Pick<CatalogItemRefSpec, 'catalog' | 'item'>,
  item?: CatalogItem | null,
): string => {
  if (item) {
    return item.spec.displayName || item.metadata.name || ref.item;
  }
  return `${ref.catalog}/${ref.item}`;
};

export const resolveCatalogRef = (item: CatalogItem, ref: CatalogItemRefSpec): ResolvedCatalogRef => {
  const version = getCurrentVersion(item, ref.version, ref);
  const displayName = getCatalogRefDisplayName(ref, item);
  const imageUri = version ? getFullContainerURI(item.spec.artifacts, version) : undefined;
  return {
    item,
    displayName,
    version,
    channel: ref.channel || '',
    imageUri,
  };
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

export const getAppType = (catalogItem: CatalogItem): AppType | undefined => {
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

/** Maps form volumes to API volumes (reference XOR catalogItemRef already in form data). */
const getCatalogApiVolumes = (volumes: ApplicationVolume[] | undefined): ApplicationVolume[] => {
  if (!volumes?.length) {
    return [];
  }

  return volumes.map((v) => {
    const vol = v as FullAppVolume;
    const catalogItemRef = vol.image?.catalogItemRef;
    const volumeImageSpec = catalogItemRef ? { catalogItemRef } : { image: vol.image?.reference || '' };
    return buildApiVolume(vol.name, volumeImageSpec, vol.image?.pullPolicy, vol.mount?.path || '');
  });
};

/**
 * RJSF leaves cleared optional string fields as "".
 * The API rejects envVar with empty values, therefore these must be dropped.
 */
const sanitizeEnvVars = (envVars: unknown): Record<string, string> | undefined => {
  if (!envVars || typeof envVars !== 'object' || Array.isArray(envVars)) {
    return undefined;
  }
  const cleaned = Object.fromEntries(
    Object.entries(envVars as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0,
    ),
  );
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
};

/**
 * RJSF leaves cleared optional string fields as "".
 * The API rejects port with empty values, therefore these must be dropped.
 */
const sanitizePorts = (ports: unknown): string[] | undefined => {
  if (!Array.isArray(ports)) {
    return undefined;
  }
  const cleaned = ports.filter((p): p is string => typeof p === 'string' && p.length > 0);
  return cleaned.length > 0 ? cleaned : undefined;
};

export const buildCatalogApplicationSpec = ({
  appName,
  catalogItem,
  catalogItemVersion,
  channel,
  formValues,
}: {
  appName: string;
  catalogItem: CatalogItem;
  catalogItemVersion: CatalogItemVersion;
  channel: string;
  formValues: Record<string, unknown> | undefined;
}): ApplicationProviderSpec => {
  const appType = getAppType(catalogItem);
  if (!appType) {
    throw new Error('Unknown application type');
  }

  // Extract the fields that need to be processed before they can be submitted to the API.
  const { volumes, envVars, ports, ...appFormValues } = formValues || {};

  const userVolumes = Array.isArray(volumes) ? [...(volumes as ApplicationVolume[])] : undefined;
  const sanitizedEnvVars = sanitizeEnvVars(envVars);
  const sanitizedPorts = sanitizePorts(ports);

  const appSpec: ApplicationProviderSpec = {
    ...appFormValues,
    ...(sanitizedEnvVars ? { envVars: sanitizedEnvVars } : {}),
    ...(sanitizedPorts ? { ports: sanitizedPorts } : {}),
    name: appName,
    appType,
    catalogItemRef: buildCatalogItemRef({ catalogItem, catalogItemVersion, channel }),
    // Explicitly clear image since the catalog item ref will be used instead
    image: undefined,
  };

  // Force Container/quadlet apps to have a "runAs" field when the schema / user form did not include it.
  const isContainerOrQuadletApp = isContainerAppSpec(appSpec) || isQuadletAppSpec(appSpec);
  if (isContainerOrQuadletApp && !appSpec.runAs) {
    appSpec.runAs = RUN_AS_ROOT_USER;
  }

  // Only set volumes to the application types that support them.
  if (isContainerOrQuadletApp || isComposeAppSpec(appSpec)) {
    appSpec.volumes = getCatalogApiVolumes(userVolumes);
  }

  return appSpec;
};

export const getAppPatches = ({
  appName,
  currentApps,
  catalogItem,
  catalogItemVersion,
  channel,
  formValues,
  specPath,
}: {
  appName: string;
  currentApps: ApplicationProviderSpec[] | undefined;
  catalogItem: CatalogItem;
  catalogItemVersion: CatalogItemVersion;
  channel: string;
  formValues: Record<string, unknown> | undefined;
  specPath: string;
}) => {
  const appSpec = buildCatalogApplicationSpec({
    appName,
    catalogItem,
    catalogItemVersion,
    channel,
    formValues,
  });

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

export const getSortedUpdates = (catalogItem: CatalogItem, currentChannel: string, currentVersion: string) =>
  getUpdates(catalogItem, currentChannel, currentVersion).sort((a, b) => semver.rcompare(a.version, b.version));
