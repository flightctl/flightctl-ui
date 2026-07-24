import { TFunction } from 'i18next';
import * as Yup from 'yup';

import {
  validApplicationsSchema,
  validConfigTemplatesSchema,
  validKubernetesLabelValue,
  validLabelsSchema,
  validOsFormValue,
  validUpdatePolicySchema,
} from '../../form/validations';
import { getDeviceLabelPatches, getStringListPatches, getUpdatePolicyPatches } from '../../../utils/patch';
import { Device, PatchRequest } from '@flightctl/types';
import { EditDeviceFormValues, UpdatePolicyForm } from './../../../types/deviceSpec';
import {
  ACMCrdConfig,
  ACMImportConfig,
  MicroshiftRegistrationHook,
  getApiConfig,
  getApplicationPatches,
  getDeviceSpecConfigPatches,
  getFormOsSpecPatches,
} from './deviceSpecUtils';

export const getValidationSchema = (t: TFunction) =>
  Yup.lazy((values: EditDeviceFormValues) =>
    Yup.object({
      deviceAlias: validKubernetesLabelValue(t, { isRequired: false, fieldName: t('Alias') }),
      osSpec: validOsFormValue(t, { isFleet: false }),
      labels: validLabelsSchema(t),
      configTemplates: validConfigTemplatesSchema(t),
      applications: validApplicationsSchema(t),
      updatePolicy:
        !values.useBasicUpdateConfig && values.updatePolicy.isAdvanced ? validUpdatePolicySchema(t) : Yup.object(),
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

  // OS patches. ATM only the image can be modified via the Device form.
  allPatches = allPatches.concat(getFormOsSpecPatches('/spec/os', currentDevice.spec?.os, updatedDevice.osSpec));

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

  // Systemd services
  const systemdUnitPatches = getStringListPatches(
    '/spec/systemd',
    currentDevice.spec?.systemd?.matchPatterns || [],
    updatedDevice.systemdUnits.map((unit) => unit.pattern),
    (list) => ({ matchPatterns: list }),
  );
  allPatches = allPatches.concat(systemdUnitPatches);

  // Updates
  const updatesPatches = getUpdatePolicyPatches('/spec/updatePolicy', currentDevice.spec?.updatePolicy, {
    ...updatedDevice.updatePolicy,
    isAdvanced: !updatedDevice.useBasicUpdateConfig,
  } as Required<UpdatePolicyForm>);
  allPatches = allPatches.concat(updatesPatches);

  return allPatches;
};
