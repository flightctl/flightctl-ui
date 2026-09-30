import * as Yup from 'yup';
import semver from 'semver';
import { load } from 'js-yaml';
import validator from '@rjsf/validator-ajv8';
import type { RJSFSchema, RJSFValidationError } from '@rjsf/utils';
import type { ApplicationProviderSpec, CatalogItemRefSpec } from '@flightctl/types';
import { type CatalogItem, CatalogItemCategory, type CatalogItemVersion } from '@flightctl/types/alpha';
import type { TFunction } from 'i18next';

import type { ApplicationEntry, CatalogAppForm } from '../../types/deviceSpec';
import { buildCatalogApplicationSpec, buildCatalogItemRef } from '../../utils/catalog';
import { toValidApplicationName, validApplicationAndVolumeName } from '../form/validations';
import { getInitialAppConfig } from '../Catalog/InstallWizard/utils';
import type { DynamicFormConfigFormik } from '../Catalog/InstallWizard/types';

export type CatalogSelectionConfirm = {
  catalogItem: CatalogItem;
  version: CatalogItemVersion;
  channel: string;
  catalogItemRef: CatalogItemRefSpec;
};

export type CatalogAdvancedConfigValues = {
  configureVia: 'editor' | 'form';
  editorContent: string;
  formValues: Record<string, unknown> | undefined;
};

export type CatalogAdvancedConfigFieldErrors = Partial<Record<'dynamicFormValid' | 'editorContent', string>>;

export type CatalogAdvancedConfigValidationResult = {
  errors: CatalogAdvancedConfigFieldErrors;
  schemaErrors: RJSFValidationError[] | undefined;
};

export const getAppNameValidationSchema = (t: TFunction) =>
  Yup.object().shape({
    appName: validApplicationAndVolumeName(t).required(t('Application name is required')),
  });

/** Shared Formik/Yup validation for catalog advanced config (form view or YAML editor). */
export const validateCatalogAdvancedConfig = (
  values: Pick<DynamicFormConfigFormik, 'configureVia' | 'editorContent' | 'configSchema' | 'dynamicFormValid'>,
  t: TFunction,
): CatalogAdvancedConfigValidationResult => {
  if (values.configureVia === 'form') {
    return {
      errors: values.dynamicFormValid ? {} : { dynamicFormValid: t('Configuration is required') },
      schemaErrors: undefined,
    };
  }

  try {
    const yamlContent = load(values.editorContent || '');
    if (values.configSchema) {
      const validationData = validator.validateFormData(yamlContent, values.configSchema as RJSFSchema);
      if (validationData.errors.length) {
        return {
          errors: { editorContent: t('Configuration is not valid') },
          schemaErrors: validationData.errors,
        };
      }
    }
    return { errors: {}, schemaErrors: undefined };
  } catch {
    return {
      errors: { editorContent: t('Not a valid configuration') },
      schemaErrors: undefined,
    };
  }
};

export const getCatalogVersionConfigSchema = (
  catalogItem: CatalogItem,
  version: string,
): Record<string, unknown> | undefined => {
  const versionEntry = catalogItem.spec.versions.find((entry) => entry.version === version);
  const schema = versionEntry?.configSchema ?? catalogItem.spec.defaults?.configSchema;
  return schema as Record<string, unknown> | undefined;
};

const schemaHasRequiredFields = (schema: Record<string, unknown> | undefined): boolean => {
  if (!schema || typeof schema !== 'object') {
    return false;
  }
  const required = schema.required;
  if (Array.isArray(required) && required.length > 0) {
    return true;
  }
  const properties = schema.properties;
  if (properties && typeof properties === 'object') {
    return Object.values(properties as Record<string, Record<string, unknown>>).some((property) =>
      schemaHasRequiredFields(property),
    );
  }
  return false;
};

/**
 * Determines whether the user needs to provide additional configuration for the selected catalog item.
 * For new apps, it's enough to check if the version has required fields without defaults.
 * For existing apps, we also need to pass in the existing app configuration.
 */
export const isAdvancedConfigRequired = (
  catalogItem: CatalogItem,
  version: string,
  existingApp?: ApplicationProviderSpec,
): boolean => {
  if (!schemaHasRequiredFields(getCatalogVersionConfigSchema(catalogItem, version))) {
    return false;
  }
  // Defaults (or an existing app) may already satisfy required fields.
  return !getInitialAppConfig(catalogItem, version, existingApp).dynamicFormValid;
};

export const isApplicationCatalogItem = (catalogItem: CatalogItem): boolean =>
  catalogItem.spec.category === CatalogItemCategory.CatalogItemCategoryApplication;

export const getCatalogItemDefaultAppName = (catalogItem: CatalogItem): string =>
  toValidApplicationName(catalogItem.spec.displayName || catalogItem.metadata.name || '');

export const buildSelectionConfirm = ({
  catalogItem,
  version,
  channel,
}: {
  catalogItem: CatalogItem;
  version: CatalogItemVersion;
  channel: string;
}): CatalogSelectionConfirm => ({
  catalogItem,
  version,
  channel,
  catalogItemRef: buildCatalogItemRef({ catalogItem, catalogItemVersion: version, channel }),
});

export const getFormValuesFromAdvancedConfig = (
  advancedConfig: CatalogAdvancedConfigValues | undefined,
): Record<string, unknown> | undefined => {
  if (!advancedConfig) {
    return undefined;
  }
  if (advancedConfig.configureVia === 'form') {
    return advancedConfig.formValues;
  }
  const parsed = load(advancedConfig.editorContent || '');
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : undefined;
};

export const getDefaultChannelAndVersion = (item: CatalogItem) => {
  if (!item.spec.versions.length) {
    return {
      version: '',
      channel: '',
    };
  }

  const versions = [...item.spec.versions].sort((v1, v2) => semver.rcompare(v1.version, v2.version));

  // release then prerelease
  const latestVersion = versions.find((v) => !semver.prerelease(v.version)) || versions[0];

  return {
    version: latestVersion.version,
    channel: latestVersion.channels[0],
  };
};

export const getSortedChannelVersions = (catalogItem: CatalogItem, channel: string): CatalogItemVersion[] =>
  catalogItem.spec.versions
    .filter((version) => version.channels.includes(channel))
    .sort((a, b) => semver.rcompare(a.version, b.version));

const toCatalogAppForm = (apiApp: ApplicationProviderSpec, catalogItemRef: CatalogItemRefSpec): CatalogAppForm => ({
  catalogItemRef,
  name: apiApp.name,
  apiApp,
});

export const createCatalogAppEntry = (
  appName: string,
  selection: CatalogSelectionConfirm,
  advancedConfig?: CatalogAdvancedConfigValues,
): ApplicationEntry => {
  const formValues = getFormValuesFromAdvancedConfig(advancedConfig);

  const apiApp = buildCatalogApplicationSpec({
    appName,
    catalogItem: selection.catalogItem,
    catalogItemVersion: selection.version,
    channel: selection.channel,
    formValues,
  });
  return { type: 'catalog', app: toCatalogAppForm(apiApp, selection.catalogItemRef) };
};

export const renameCatalogAppForm = (app: CatalogAppForm, name: string): CatalogAppForm => {
  return {
    ...app,
    name,
    apiApp: { ...app.apiApp, name },
  };
};

export const updateCatalogAppFormConfig = ({
  appForm,
  catalogItem,
  appName,
  advancedConfig,
}: {
  appForm: CatalogAppForm;
  catalogItem: CatalogItem;
  appName: string;
  advancedConfig: CatalogAdvancedConfigValues;
}): CatalogAppForm => {
  const versionEntry = catalogItem.spec.versions.find((entry) => entry.version === appForm.catalogItemRef.version);
  if (!versionEntry) {
    return renameCatalogAppForm(appForm, appName);
  }
  const channel = appForm.catalogItemRef.channel || getDefaultChannelAndVersion(catalogItem).channel;
  const formValues = getFormValuesFromAdvancedConfig(advancedConfig);

  const apiApp = buildCatalogApplicationSpec({
    appName,
    catalogItem,
    catalogItemVersion: versionEntry,
    channel,
    formValues,
  });

  // Version stays locked to the existing pin.
  return toCatalogAppForm(apiApp, appForm.catalogItemRef);
};
