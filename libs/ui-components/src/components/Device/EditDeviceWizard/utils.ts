import { TFunction } from 'i18next';
import * as Yup from 'yup';

import {
  validApplicationsSchema,
  validConfigTemplatesSchema,
  validKubernetesLabelValue,
  validLabelsSchema,
  validOsImage,
  validUpdatePolicySchema,
} from '../../form/validations';
import { appendJSONPatch, getDeviceLabelPatches, getUpdatePolicyPatches } from '../../../utils/patch';
import { Device, PatchRequest } from '@flightctl/types';
import { EditDeviceFormValues, UpdatePolicyForm } from './../../../types/deviceSpec';
import {
  ACMCrdConfig,
  ACMImportConfig,
  MicroshiftRegistrationHook,
  getApiConfig,
  getApplicationPatches,
  getDeviceSpecConfigPatches,
} from './deviceSpecUtils';

export const getValidationSchema = (t: TFunction) =>
  Yup.lazy((values: EditDeviceFormValues) =>
    Yup.object({
      deviceAlias: validKubernetesLabelValue(t, { isRequired: false, fieldName: t('Alias') }),
      osImage: validOsImage(t, { isFleet: false }),
      labels: validLabelsSchema(t),
      configTemplates: validConfigTemplatesSchema(t),
      applications: validApplicationsSchema(t),
      updatePolicy: values.updatePolicy.isAdvanced ? validUpdatePolicySchema(t) : Yup.object(),
    }),
  );

export const getDevicePatches = (currentDevice: Device, updatedDevice: EditDeviceFormValues) => {
  let allPatches: PatchRequest = [];

  // Device labels
  const currentLabels = currentDevice.metadata.labels || {};
  const updatedLabels = [...updatedDevice.labels];

  const deviceLabelPatches = getDeviceLabelPatches(currentLabels, updatedLabels, updatedDevice.deviceAlias);
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
  const newConfigs = updatedDevice.configTemplates.map(getApiConfig);
  if (updatedDevice.registerMicroShift) {
    newConfigs.push(ACMCrdConfig, ACMImportConfig, MicroshiftRegistrationHook);
  }
  const configPatches = getDeviceSpecConfigPatches(currentConfigs, newConfigs, '/spec/config');
  allPatches = allPatches.concat(configPatches);

  // Applications
  const appPatches = getApplicationPatches('/spec', currentDevice.spec?.applications || [], updatedDevice.applications);
  allPatches = allPatches.concat(appPatches);

  // Updates
  const updatesPatches = getUpdatePolicyPatches('/spec/updatePolicy', currentDevice.spec?.updatePolicy, {
    ...updatedDevice.updatePolicy,
    isAdvanced: !updatedDevice.useBasicUpdateConfig,
  } as Required<UpdatePolicyForm>);
  allPatches = allPatches.concat(updatesPatches);

  return allPatches;
};
