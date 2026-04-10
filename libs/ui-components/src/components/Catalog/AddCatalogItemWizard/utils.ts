import * as Yup from 'yup';
import * as semver from 'semver';
import validator from '@rjsf/validator-ajv8';
import { RJSFSchema } from '@rjsf/utils';
import { dump, load } from 'js-yaml';
import { TFunction } from 'i18next';
import isEqual from 'lodash/isEqual';
import {
  ApiVersion,
  Catalog,
  CatalogItem,
  CatalogItemArtifact,
  CatalogItemArtifactType,
  CatalogItemCategory,
  CatalogItemConfigurable,
  CatalogItemType,
  CatalogItemVersion,
} from '@flightctl/types/alpha';
import { PatchRequest } from '@flightctl/types';

import {
  AddCatalogItemFormValues,
  ArtifactFormValue,
  CreateCatalogFormValues,
  VersionFormValues,
  configurableAppTypes,
} from './types';
import { appTypeIds } from '../useCatalogs';
import { getKubernetesDnsSubdomainErrors, validKubernetesDnsSubdomain, validURLSchema } from '../../form/validations';
import { appendJSONPatch } from '../../../utils/patch';

const parseYamlField = (value: string): Record<string, unknown> | undefined => {
  if (!value.trim()) {
    return undefined;
  }
  return load(value) as Record<string, unknown>;
};

const dumpYamlField = (value: Record<string, unknown> | undefined): string => {
  if (!value || Object.keys(value).length === 0) {
    return '';
  }
  return dump(value, { lineWidth: -1 }).trimEnd();
};

export const getEmptyVersion = (): VersionFormValues => ({
  version: '',
  references: {},
  channels: [],
  replaces: '',
  skips: '',
  skipRange: '',
  readme: '',
  config: '',
  configSchema: '',
  deprecated: false,
  deprecationMessage: '',
});

export const getEmptyArtifact = (): ArtifactFormValue => ({
  type: '',
  name: '',
  uri: '',
});

export const getInitialValues = (): AddCatalogItemFormValues => ({
  catalog: '',
  name: '',
  displayName: '',
  shortDescription: '',
  icon: '',
  type: '',
  artifacts: [getEmptyArtifact()],
  containerUri: '',
  provider: '',
  homepage: '',
  supportUrl: '',
  documentationUrl: '',
  versions: [getEmptyVersion()],
  defaultConfig: '',
  defaultConfigSchema: '',
  deprecated: false,
  deprecationMessage: '',
  deprecationReplacement: '',
});

const getCategoryForType = (type: CatalogItemType): CatalogItemCategory => {
  if (appTypeIds.includes(type)) {
    return CatalogItemCategory.CatalogItemCategoryApplication;
  }
  return CatalogItemCategory.CatalogItemCategorySystem;
};

const isAppType = (type: CatalogItemType): boolean => appTypeIds.includes(type);

const isConfigurableType = (type: CatalogItemType): boolean => configurableAppTypes.includes(type);

const formVersionsToApi = (values: AddCatalogItemFormValues) => {
  const configurable = isConfigurableType(values.type as CatalogItemType);
  return values.versions.map((v) => {
    const skips = v.skips
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const references = Object.fromEntries(Object.entries(v.references).filter(([, val]) => val.trim() !== ''));

    const versionDef: CatalogItemVersion = {
      version: v.version,
      references,
      channels: v.channels,
      replaces: v.replaces || undefined,
      skips: skips.length ? skips : undefined,
      skipRange: v.skipRange || undefined,
      readme: v.readme || undefined,
      config: configurable ? parseYamlField(v.config) : undefined,
      configSchema: configurable ? parseSchemaField(v.configSchema) : undefined,
      deprecation: v.deprecated ? { message: v.deprecationMessage } : undefined,
    };

    return Object.fromEntries(
      Object.entries(versionDef).filter(([, value]) => value !== undefined),
    ) as CatalogItemVersion;
  });
};

const formArtifactsToApi = (artifacts: ArtifactFormValue[]) =>
  artifacts
    .filter((a) => a.uri && a.type)
    .map((a) => {
      const apiArtifact = {
        type: a.type,
        uri: a.uri,
      } as CatalogItemArtifact;
      if (a.name) {
        apiArtifact.name = a.name;
      }
      return apiArtifact;
    });

const formDefaultsToApi = (values: AddCatalogItemFormValues): CatalogItemConfigurable | undefined => {
  if (!isConfigurableType(values.type as CatalogItemType)) {
    return undefined;
  }
  const defaultConfig = parseYamlField(values.defaultConfig);
  const defaultConfigSchema = parseSchemaField(values.defaultConfigSchema);
  if (defaultConfig || defaultConfigSchema) {
    return {
      config: defaultConfig,
      configSchema: defaultConfigSchema,
    };
  }
  return undefined;
};

const formValuesToArtifacts = (values: AddCatalogItemFormValues): CatalogItemArtifact[] => {
  const artifacts = formArtifactsToApi(values.artifacts);
  if (isAppType(values.type as CatalogItemType)) {
    const containerArtifact = artifacts.find(
      (a) => a.type === CatalogItemArtifactType.CatalogItemArtifactTypeContainer,
    );
    if (containerArtifact) {
      containerArtifact.uri = values.containerUri;
    } else {
      artifacts.push({
        type: CatalogItemArtifactType.CatalogItemArtifactTypeContainer,
        uri: values.containerUri,
      });
    }
  }
  return artifacts;
};

export const getCatalogItemResource = (values: AddCatalogItemFormValues, catalog: string): CatalogItem => {
  const type = values.type as CatalogItemType;

  return {
    apiVersion: ApiVersion.V1ALPHA1,
    kind: 'CatalogItem',
    metadata: {
      name: values.name,
      catalog,
    },
    spec: {
      type,
      category: getCategoryForType(type),
      artifacts: formValuesToArtifacts(values),
      versions: formVersionsToApi(values),
      defaults: formDefaultsToApi(values),
      displayName: values.displayName || undefined,
      shortDescription: values.shortDescription || undefined,
      icon: values.icon || undefined,
      provider: values.provider || undefined,
      homepage: values.homepage || undefined,
      support: values.supportUrl || undefined,
      documentationUrl: values.documentationUrl || undefined,
      deprecation: values.deprecated
        ? { message: values.deprecationMessage, replacement: values.deprecationReplacement || undefined }
        : undefined,
    },
  };
};

const addVersionPatches = (
  patches: PatchRequest,
  currentVersions: CatalogItemVersion[],
  newVersions: CatalogItemVersion[],
) => {
  const currentLen = currentVersions.length;
  const newLen = newVersions.length;

  if (currentLen === 0 && newLen > 0) {
    patches.push({ path: '/spec/versions', op: 'add', value: newVersions });
  } else if (currentLen > 0 && newLen === 0) {
    patches.push({ path: '/spec/versions', op: 'remove' });
  } else if (currentLen !== newLen) {
    patches.push({ path: '/spec/versions', op: 'replace', value: newVersions });
  } else {
    currentVersions.forEach((currentVersion, index) => {
      const newVersion = newVersions[index];
      if (!isEqual(currentVersion, newVersion)) {
        patches.push({
          path: `/spec/versions/${index}`,
          op: 'replace',
          value: newVersion,
        });
      }
    });
  }
};

export const getCatalogItemPatches = (values: AddCatalogItemFormValues, original: CatalogItem): PatchRequest => {
  const patches: PatchRequest = [];
  const spec = original.spec;

  const newArtifacts = formValuesToArtifacts(values);
  appendJSONPatch({
    patches,
    path: '/spec/artifacts',
    newValue: newArtifacts,
    originalValue: spec.artifacts,
  });

  addVersionPatches(patches, spec.versions, formVersionsToApi(values));

  const newDefaults = formDefaultsToApi(values);
  appendJSONPatch({
    patches,
    path: '/spec/defaults',
    newValue: newDefaults,
    originalValue: spec.defaults,
  });

  appendJSONPatch({
    patches,
    path: '/spec/displayName',
    newValue: values.displayName || undefined,
    originalValue: spec.displayName,
  });

  appendJSONPatch({
    patches,
    path: '/spec/shortDescription',
    newValue: values.shortDescription || undefined,
    originalValue: spec.shortDescription,
  });

  appendJSONPatch({
    patches,
    path: '/spec/icon',
    newValue: values.icon || undefined,
    originalValue: spec.icon,
  });

  appendJSONPatch({
    patches,
    path: '/spec/provider',
    newValue: values.provider || undefined,
    originalValue: spec.provider,
  });

  appendJSONPatch({
    patches,
    path: '/spec/homepage',
    newValue: values.homepage || undefined,
    originalValue: spec.homepage,
  });

  appendJSONPatch({
    patches,
    path: '/spec/support',
    newValue: values.supportUrl || undefined,
    originalValue: spec.support,
  });

  appendJSONPatch({
    patches,
    path: '/spec/documentationUrl',
    newValue: values.documentationUrl || undefined,
    originalValue: spec.documentationUrl,
  });

  const newDeprecation = values.deprecated
    ? { message: values.deprecationMessage, replacement: values.deprecationReplacement || undefined }
    : undefined;
  appendJSONPatch({
    patches,
    path: '/spec/deprecation',
    newValue: newDeprecation,
    originalValue: spec.deprecation,
  });

  return patches;
};

const parseJsonOrYaml = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return load(value);
  }
};

const parseSchemaField = (value: string): Record<string, unknown> | undefined => {
  if (!value.trim()) {
    return undefined;
  }
  return parseJsonOrYaml(value) as Record<string, unknown>;
};

const jsonSchemaFieldSchema = (t: TFunction) =>
  Yup.string().test('valid-json-schema', t('Must be a valid JSON Schema (JSON or YAML)'), (value) => {
    if (!value?.trim()) {
      return true;
    }
    try {
      const parsed = parseJsonOrYaml(value);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return false;
      }
      validator.validateFormData({}, parsed as RJSFSchema);
      return true;
    } catch {
      return false;
    }
  });

const optionalSemver = (t: TFunction) =>
  Yup.string().test('valid-semver', t('Must be a valid semantic version (e.g. 1.0.0, v2.1.0-rc1)'), (value) => {
    if (!value) {
      return true;
    }
    return semver.valid(value) !== null;
  });

const optionalSemverList = (t: TFunction) =>
  Yup.string().test(
    'valid-semver-list',
    t('Each entry must be a valid semantic version (e.g. 1.0.0, v2.1.0-rc1)'),
    (value) => {
      if (!value?.trim()) {
        return true;
      }
      return value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .every((v) => semver.valid(v) !== null);
    },
  );

const optionalSemverRange = (t: TFunction) =>
  Yup.string().test('valid-semver-range', t('Must be a valid semver range (e.g. >=1.0.0 <2.0.0)'), (value) => {
    if (!value?.trim()) {
      return true;
    }
    return semver.validRange(value) !== null;
  });

const yamlFieldSchema = (t: TFunction) =>
  Yup.string().test('valid-yaml-json', t('Must be a valid YAML or JSON object'), (value) => {
    if (!value || value.trim() === '') {
      return true;
    }
    try {
      const parsed = load(value);
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
    } catch {
      return false;
    }
  });

const versionSchema = (t: TFunction, duplicates: Set<string>, configurable: boolean, isApp: boolean) =>
  Yup.object().shape({
    version: Yup.string()
      .required(t('Version is required'))
      .test('valid-semver', t('Must be a valid semantic version (e.g. 1.0.0, v2.1.0-rc1)'), (value) => {
        if (!value) {
          return true;
        }
        return semver.valid(value) !== null;
      })
      .test('unique-version', t('Version must be unique'), (value) => {
        if (!value) {
          return true;
        }
        return !duplicates.has(value);
      }),
    references: Yup.object().test(
      'at-least-one-reference',
      isApp ? t('Container reference is required') : t('At least one artifact reference is required'),
      (value) => {
        if (!value || typeof value !== 'object') {
          return false;
        }
        const refs = value as Record<string, string>;
        if (isApp) {
          const containerRef = refs[CatalogItemArtifactType.CatalogItemArtifactTypeContainer];
          return typeof containerRef === 'string' && containerRef.trim() !== '';
        }
        return Object.values(refs).some((v) => typeof v === 'string' && v.trim() !== '');
      },
    ),
    channels: Yup.array()
      .of(Yup.string().required())
      .min(1, t('At least one channel is required'))
      .test('valid-dns-subdomain-channels', (channels: string[] | undefined, testContext) => {
        if (!channels) {
          return true;
        }
        const invalidChannels = channels.filter((ch) => Object.keys(getKubernetesDnsSubdomainErrors(ch)).length > 0);
        if (invalidChannels.length > 0) {
          return testContext.createError({
            message: t(
              'Channel names must be valid DNS subdomain names (lowercase alphanumeric, hyphens, dots). Invalid: {{ channels }}',
              { channels: invalidChannels.join(', ') },
            ),
          });
        }
        return true;
      }),
    replaces: optionalSemver(t),
    skips: optionalSemverList(t),
    skipRange: optionalSemverRange(t),
    readme: Yup.string(),
    config: configurable ? yamlFieldSchema(t) : Yup.string(),
    configSchema: configurable ? jsonSchemaFieldSchema(t) : Yup.string(),
    deprecated: Yup.boolean(),
    deprecationMessage: Yup.string().when('deprecated', {
      is: true,
      then: (schema) => schema.required(t('Deprecation message is required')),
    }),
  });

const versionsSchema = (t: TFunction, configurable: boolean, isApp: boolean) =>
  Yup.lazy((versions: VersionFormValues[]) => {
    const versionNames = (versions || []).map((v) => v.version);
    const duplicates = new Set(versionNames.filter((name, i) => name && versionNames.indexOf(name) !== i));

    return Yup.array()
      .of(versionSchema(t, duplicates, configurable, isApp))
      .min(1, t('At least one version is required'));
  });

const artifactURISchema = (t: TFunction) =>
  Yup.string()
    .required(t('Container image URI is required'))
    .test(
      'no-tag-or-digest',
      t('URI must not include a tag (":") or digest ("@"). Specify those in the version fields.'),
      (value) => {
        if (!value) {
          return true;
        }
        const path = value.replace(/^[a-z]+:\/\//, '');
        const imageName = path.includes('/') ? path.substring(path.lastIndexOf('/') + 1) : path;
        return !imageName.includes(':') && !imageName.includes('@');
      },
    );

export const getValidationSchema = (t: TFunction) =>
  Yup.object().shape({
    catalog: Yup.string().required(t('Catalog is required')),
    name: validKubernetesDnsSubdomain(t, { isRequired: true }),
    displayName: Yup.string(),
    shortDescription: Yup.string(),
    icon: Yup.string().test(
      'url-or-data-uri',
      t('Must be a valid URL or data URI'),
      (value) => !value || /^(https?:\/\/|data:)/.test(value),
    ),
    type: Yup.string().oneOf(Object.values(CatalogItemType)).required(t('Type is required')),
    containerUri: Yup.string().when('type', {
      is: (type: string) => appTypeIds.includes(type as CatalogItemType),
      then: () => artifactURISchema(t),
      otherwise: () => Yup.string(),
    }),
    artifacts: Yup.mixed().when('type', {
      is: (type: string) => !appTypeIds.includes(type as CatalogItemType),
      then: () =>
        Yup.lazy((artifacts: ArtifactFormValue[]) => {
          const typeCounts = new Map<string, number>();
          (artifacts || []).forEach((a) => {
            if (a.type) {
              typeCounts.set(a.type, (typeCounts.get(a.type) || 0) + 1);
            }
          });
          const duplicateTypes = new Set(
            [...typeCounts.entries()].filter(([, count]) => count > 1).map(([type]) => type),
          );

          return Yup.array()
            .of(
              Yup.object().shape({
                type: Yup.string()
                  .oneOf([...Object.values(CatalogItemArtifactType), ''], t('Invalid artifact type'))
                  .test('unique-type', t('Each artifact type can only be used once'), (value) => {
                    if (!value) {
                      return true;
                    }
                    return !duplicateTypes.has(value);
                  }),
                name: Yup.string(),
                uri: artifactURISchema(t),
              }),
            )
            .min(1, t('At least one artifact is required'));
        }),
      otherwise: () => Yup.array(),
    }),
    provider: Yup.string(),
    homepage: validURLSchema(t),
    supportUrl: validURLSchema(t),
    documentationUrl: validURLSchema(t),
    versions: Yup.mixed().when('type', ([type]: string[]) => {
      const itemType = type as CatalogItemType;
      const configurable = configurableAppTypes.includes(itemType);
      const isApp = appTypeIds.includes(itemType);
      return versionsSchema(t, configurable, isApp);
    }) as unknown as Yup.ArraySchema<VersionFormValues[], Yup.AnyObject>,
    defaultConfig: Yup.string().when('type', {
      is: (type: string) => configurableAppTypes.includes(type as CatalogItemType),
      then: () => yamlFieldSchema(t),
      otherwise: () => Yup.string(),
    }),
    defaultConfigSchema: Yup.string().when('type', {
      is: (type: string) => configurableAppTypes.includes(type as CatalogItemType),
      then: () => jsonSchemaFieldSchema(t),
      otherwise: () => Yup.string(),
    }),
    deprecated: Yup.boolean(),
    deprecationMessage: Yup.string().when('deprecated', {
      is: true,
      then: (schema) => schema.required(t('Deprecation message is required')),
    }),
    deprecationReplacement: Yup.string(),
  });

export const getInitialValuesFromItem = (item: CatalogItem): AddCatalogItemFormValues => {
  const versions: VersionFormValues[] = item.spec.versions.map((v) => {
    return {
      version: v.version,
      references: v.references,
      channels: [...v.channels],
      replaces: v.replaces || '',
      skips: v.skips?.join(', ') || '',
      skipRange: v.skipRange || '',
      readme: v.readme || '',
      config: dumpYamlField(v.config as Record<string, unknown> | undefined),
      configSchema: dumpYamlField(v.configSchema as Record<string, unknown> | undefined),
      deprecated: !!v.deprecation,
      deprecationMessage: v.deprecation?.message || '',
    };
  });

  const artifacts: ArtifactFormValue[] = item.spec.artifacts?.map((a) => ({
    type: a.type || '',
    name: a.name || '',
    uri: a.uri,
  })) || [getEmptyArtifact()];

  const containerArtifact = isAppType(item.spec.type)
    ? item.spec.artifacts.find((a) => a.type === CatalogItemArtifactType.CatalogItemArtifactTypeContainer)
    : undefined;

  return {
    catalog: item.metadata.catalog,
    name: item.metadata.name!,
    displayName: item.spec.displayName || '',
    shortDescription: item.spec.shortDescription || '',
    icon: item.spec.icon || '',
    type: item.spec.type,
    artifacts,
    containerUri: containerArtifact?.uri || '',
    provider: item.spec.provider || '',
    homepage: item.spec.homepage || '',
    supportUrl: item.spec.support || '',
    documentationUrl: item.spec.documentationUrl || '',
    versions: versions.length ? versions : [getEmptyVersion()],
    defaultConfig: dumpYamlField(item.spec.defaults?.config as Record<string, unknown> | undefined),
    defaultConfigSchema: dumpYamlField(item.spec.defaults?.configSchema as Record<string, unknown> | undefined),
    deprecated: !!item.spec.deprecation,
    deprecationMessage: item.spec.deprecation?.message || '',
    deprecationReplacement: item.spec.deprecation?.replacement || '',
  };
};

export const getCatalogPatches = (catalog: Catalog, values: CreateCatalogFormValues) => {
  const patches: PatchRequest = [];

  appendJSONPatch({
    patches,
    path: '/spec/displayName',
    newValue: values.displayName,
    originalValue: catalog.spec.displayName,
  });
  appendJSONPatch({
    patches,
    path: '/spec/shortDescription',
    newValue: values.shortDescription,
    originalValue: catalog.spec.shortDescription,
  });
  appendJSONPatch({
    patches,
    path: '/spec/icon',
    newValue: values.icon,
    originalValue: catalog.spec.icon,
  });
  appendJSONPatch({
    patches,
    path: '/spec/provider',
    newValue: values.provider,
    originalValue: catalog.spec.provider,
  });
  appendJSONPatch({
    patches,
    path: '/spec/support',
    newValue: values.support,
    originalValue: catalog.spec.support,
  });
  return patches;
};

export const getCatalogResource = (values: CreateCatalogFormValues): Catalog => ({
  apiVersion: ApiVersion.V1ALPHA1,
  kind: 'Catalog',
  metadata: { name: values.name },
  spec: {
    displayName: values.displayName || undefined,
    shortDescription: values.shortDescription || undefined,
    icon: values.icon || undefined,
    provider: values.provider || undefined,
    support: values.support || undefined,
  },
});
