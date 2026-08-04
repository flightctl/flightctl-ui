import { CatalogItem } from '@flightctl/types/alpha';
import validator from '@rjsf/validator-ajv8';
import { createSchemaUtils } from '@rjsf/utils';
import merge from 'lodash/merge';
import { FormikHelpers } from 'formik';

import type { ApplicationProviderSpec, ImageMountVolumeProviderSpec } from '@flightctl/types';
import type { VolumeCatalogSelection } from '../../../utils/catalog';
import { DynamicFormConfigFormik } from './types';
import { convertObjToYAMLString } from '../../common/CodeEditor/YamlEditor';

const appSpecFilteredKeys = ['name', 'appType', 'catalogItemRef'];

export const getInitialAppConfig = (
  catalogItem: CatalogItem,
  version: string | undefined,
  existingApp?: ApplicationProviderSpec,
): DynamicFormConfigFormik => {
  const configSchema =
    catalogItem.spec.versions.find((v) => v.version === version)?.configSchema ??
    catalogItem?.spec.defaults?.configSchema;
  let defaultConfig =
    catalogItem.spec.versions.find((v) => v.version === version)?.config ?? catalogItem?.spec.defaults?.config;

  let formValues: Record<string, unknown> = {};
  if (configSchema) {
    const schemaUtils = createSchemaUtils(validator, configSchema);
    formValues = schemaUtils.getDefaultFormState(configSchema) as Record<string, unknown>;
  }

  const volumeSelection: VolumeCatalogSelection[] = [];
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

    const existingVolumes = formValues.volumes;
    if (Array.isArray(existingVolumes)) {
      (existingVolumes as ImageMountVolumeProviderSpec[]).forEach((vol, idx) => {
        const catalogItemRef = vol.image?.catalogItemRef;
        if (catalogItemRef) {
          volumeSelection.push({
            volumeIndex: idx,
            catalogItemRef,
          });
          // Ensure the "image.reference" field is the empty string when there's a Catalog item reference.
          // The JSON schema `required` validation fails if the value is undefined.
          vol.image.reference = '';
        }
      });
    }
  }

  const dynamicFormValid = configSchema
    ? validator.validateFormData(formValues, configSchema).errors?.length === 0
    : true;

  return {
    appName: existingApp?.name || '',
    configureVia: configSchema ? 'form' : 'editor',
    editorContent: defaultConfig ? convertObjToYAMLString(defaultConfig) : '',
    volumeSelection,
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
  setFieldValue('volumeSelection', appConfig.volumeSelection, true);
};
