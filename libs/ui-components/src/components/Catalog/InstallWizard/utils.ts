import validator from '@rjsf/validator-ajv8';
import { type RJSFSchema, createSchemaUtils } from '@rjsf/utils';
import merge from 'lodash/merge';
import type { FormikHelpers } from 'formik';

import type { ApplicationProviderSpec, CatalogItemRefSpec } from '@flightctl/types';
import type { CatalogItem } from '@flightctl/types/alpha';
import type { DynamicFormConfigFormik } from './types';
import { convertObjToYAMLString } from '../../common/CodeEditor/YamlEditor';
import { enrichConfigSchemaForVolumeImages } from '../../DynamicForm/VolumeImageField';

const appSpecFilteredKeys = ['name', 'appType', 'catalogItemRef'];

export const isSameCatalogRef = (
  catalogRef: CatalogItemRefSpec | undefined,
  catalogItem: CatalogItem,
  version: string,
  channel: string,
) => {
  if (!catalogRef) {
    return false;
  }
  return (
    catalogRef.item === catalogItem.metadata.name &&
    catalogRef.catalog === catalogItem.metadata.catalog &&
    catalogRef.version === version &&
    // channel is optional on the API; treat undefined and '' as equivalent
    (catalogRef.channel || '') === (channel || '')
  );
};

export const getInitialAppConfig = (
  catalogItem: CatalogItem,
  version: string | undefined,
  existingApp?: ApplicationProviderSpec,
): DynamicFormConfigFormik => {
  const rawConfigSchema =
    catalogItem.spec.versions.find((v) => v.version === version)?.configSchema ??
    catalogItem?.spec.defaults?.configSchema;
  const configSchema = rawConfigSchema ? enrichConfigSchemaForVolumeImages(rawConfigSchema as RJSFSchema) : undefined;

  let defaultConfig =
    catalogItem.spec.versions.find((v) => v.version === version)?.config ?? catalogItem?.spec.defaults?.config;

  let formValues: Record<string, unknown> = {};
  if (configSchema) {
    const schemaUtils = createSchemaUtils(validator, configSchema);
    formValues = schemaUtils.getDefaultFormState(configSchema) as Record<string, unknown>;
  }

  if (existingApp) {
    const appConfig = Object.keys(existingApp).reduce(
      (acc, key) => {
        if (!appSpecFilteredKeys.includes(key)) {
          acc[key] = existingApp[key] as unknown;
        }
        return acc;
      },
      {} as Record<string, unknown>,
    );

    formValues = merge({}, formValues, appConfig);
    defaultConfig = merge({}, defaultConfig || {}, appConfig);
  }

  const dynamicFormValid = configSchema
    ? validator.validateFormData(formValues, configSchema).errors?.length === 0
    : true;

  return {
    appName: existingApp?.name || '',
    configureVia: configSchema ? 'form' : 'editor',
    editorContent: defaultConfig ? convertObjToYAMLString(defaultConfig) : '',
    formValues,
    configSchema,
    dynamicFormValid,
  };
};

export const applyInitialConfig = (
  setFieldValue: FormikHelpers<unknown>['setFieldValue'],
  appConfig: DynamicFormConfigFormik,
) => {
  setFieldValue('configSchema', appConfig.configSchema, true);
  setFieldValue('configureVia', appConfig.configureVia, true);
  setFieldValue('dynamicFormValid', appConfig.dynamicFormValid, true);
  setFieldValue('editorContent', appConfig.editorContent, true);
  setFieldValue('formValues', appConfig.formValues, true);
};
