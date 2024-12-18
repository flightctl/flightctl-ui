import { TFunction } from 'i18next';
import * as Yup from 'yup';

import {
  maxLengthString,
  validApplicationsSchema,
  validConfigTemplatesSchema,
  validKubernetesLabelValue,
  validLabelsSchema,
} from '../../form/validations';
import { appendJSONPatch, getApplicationPatches, getLabelPatches } from '../../../utils/patch';
import { Device, PatchRequest } from '@flightctl/types';
import { EditDeviceFormValues } from './types';
import {
  ACMCrdConfig,
  ACMImportConfig,
  MicroshiftRegistrationHook,
  getAPIConfig,
  getDeviceSpecConfigPatches,
} from './deviceSpecUtils';

export const getValidationSchema = (t: TFunction) =>
  Yup.lazy(() =>
    Yup.object({
      deviceAlias: validKubernetesLabelValue(t, { isRequired: false, fieldName: t('Alias') }),
      osImage: maxLengthString(t, { fieldName: t('System image'), maxLength: 2048 }),
      labels: validLabelsSchema(t),
      configTemplates: validConfigTemplatesSchema(t),
      applications: validApplicationsSchema(t),
    }),
  );

export const getDevicePatches = (currentDevice: Device, updatedDevice: EditDeviceFormValues) => {
  let allPatches: PatchRequest = [];

  // Device labels
  const currentLabels = currentDevice.metadata.labels || {};
  const updatedLabels = [...updatedDevice.labels];

  if (updatedDevice.deviceAlias) {
    updatedLabels.push({ key: 'alias', value: updatedDevice.deviceAlias });
  }

  const deviceLabelPatches = getLabelPatches('/metadata/labels', currentLabels, updatedLabels);
  allPatches = allPatches.concat(deviceLabelPatches);

  if (updatedDevice.fleetMatch) {
    // The change in device labels makes the device bound to a fleet. Only the labels can be updated.
    return allPatches;
  }

  // OS image
  const currentOsImage = currentDevice.spec?.os?.image;
  const newOsImage = updatedDevice.osImage;
  if (!currentOsImage && newOsImage) {
    allPatches.push({
      path: '/spec/os',
      op: 'add',
      value: { image: newOsImage },
    });
  } else if (!newOsImage && currentOsImage) {
    allPatches.push({
      path: '/spec/os',
      op: 'remove',
    });
  } else if (newOsImage && currentOsImage !== newOsImage) {
    appendJSONPatch({
      path: '/spec/os/image',
      patches: allPatches,
      newValue: newOsImage,
      originalValue: currentOsImage,
    });
  }

  // Configurations
  const currentConfigs = currentDevice.spec?.config || [];
  const newConfigs = updatedDevice.configTemplates.map(getAPIConfig);
  if (updatedDevice.registerMicroShift) {
    newConfigs.push(ACMCrdConfig, ACMImportConfig, MicroshiftRegistrationHook);
  }
  const configPatches = getDeviceSpecConfigPatches(currentConfigs, newConfigs, '/spec/config');
  allPatches = allPatches.concat(configPatches);

  // Applications
  const appPatches = getApplicationPatches('/spec', currentDevice.spec?.applications || [], updatedDevice.applications);
  allPatches = allPatches.concat(appPatches);

  return allPatches;
};
