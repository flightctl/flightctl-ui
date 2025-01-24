import { Fleet, PatchRequest } from '@flightctl/types';
import { TFunction } from 'i18next';
import * as Yup from 'yup';
import { FleetFormValues } from './types';
import { API_VERSION } from '../../../constants';
import { toAPILabel } from '../../../utils/labels';
import {
  systemdUnitListValidationSchema,
  validApplicationsSchema,
  validConfigTemplatesSchema,
  validFleetRolloutPolicySchema,
  validKubernetesDnsSubdomain,
  validLabelsSchema,
  validOsImage,
} from '../../form/validations';
import {
  appendJSONPatch,
  getApplicationPatches,
  getLabelPatches,
  getRolloutPolicyData,
  getRolloutPolicyPatches,
  getStringListPatches,
  toAPIApplication,
} from '../../../utils/patch';
import {
  ACMCrdConfig,
  ACMImportConfig,
  MicroshiftRegistrationHook,
  getAPIConfig,
  getApplicationValues,
  getConfigTemplatesValues,
  getDeviceSpecConfigPatches,
  hasMicroshiftRegistrationConfig,
} from '../../Device/EditDeviceWizard/deviceSpecUtils';
import { getRolloutPolicyValues } from './fleetSpecUtils';

export const getValidationSchema = (t: TFunction) => {
  return Yup.object<FleetFormValues>({
    name: validKubernetesDnsSubdomain(t, { isRequired: true }),
    osImage: validOsImage(t, { isFleet: true }),
    fleetLabels: validLabelsSchema(t),
    labels: validLabelsSchema(t),
    configTemplates: validConfigTemplatesSchema(t),
    applications: validApplicationsSchema(t),
    systemdUnits: systemdUnitListValidationSchema(t),
    rolloutPolicy: validFleetRolloutPolicySchema(t),
  });
};

export const getFleetPatches = (currentFleet: Fleet, updatedFleet: FleetFormValues) => {
  let allPatches: PatchRequest = [];

  // Fleet labels
  const currentLabels = currentFleet.metadata.labels || {};
  const updatedLabels = updatedFleet.fleetLabels || {};

  const fleetLabelPatches = getLabelPatches('/metadata/labels', currentLabels, updatedLabels);
  allPatches = allPatches.concat(fleetLabelPatches);

  // Device label selector
  const currentDeviceSelectLabels = currentFleet.spec.selector?.matchLabels || {};
  const updatedDeviceSelectLabels = updatedFleet.labels || {};
  const updatedDeviceSelectLabelCount = Object.keys(updatedDeviceSelectLabels).length;

  if (updatedDeviceSelectLabelCount > 0) {
    if (currentFleet.spec.selector) {
      const deviceSelectLabelPatches = getLabelPatches(
        '/spec/selector/matchLabels',
        currentDeviceSelectLabels,
        updatedDeviceSelectLabels,
      );
      allPatches = allPatches.concat(deviceSelectLabelPatches);
    } else {
      const newLabelMap = toAPILabel(updatedDeviceSelectLabels);
      allPatches.push({
        path: '/spec/selector',
        op: 'add',
        value: { matchLabels: newLabelMap },
      });
    }
  } else if (currentFleet.spec.selector) {
    allPatches.push({
      path: '/spec/selector',
      op: 'remove',
    });
  }

  // OS image
  const currentOsImage = currentFleet.spec.template.spec.os?.image;
  const newOsImage = updatedFleet.osImage;
  if (!currentOsImage && newOsImage) {
    allPatches.push({
      path: '/spec/template/spec/os',
      op: 'add',
      value: { image: newOsImage },
    });
  } else if (!newOsImage && currentOsImage) {
    allPatches.push({
      path: '/spec/template/spec/os',
      op: 'remove',
    });
  } else if (newOsImage && currentOsImage !== newOsImage) {
    appendJSONPatch({
      path: '/spec/template/spec/os/image',
      patches: allPatches,
      newValue: newOsImage,
      originalValue: currentOsImage,
    });
  }

  // Configurations
  const currentConfigs = currentFleet.spec.template.spec.config || [];
  const newConfigs = updatedFleet.configTemplates.map(getAPIConfig);
  if (updatedFleet.registerMicroShift) {
    newConfigs.push(ACMCrdConfig, ACMImportConfig, MicroshiftRegistrationHook);
  }
  const configPatches = getDeviceSpecConfigPatches(currentConfigs, newConfigs, '/spec/template/spec/config');
  allPatches = allPatches.concat(configPatches);

  // Applications
  const appPatches = getApplicationPatches(
    '/spec/template/spec',
    currentFleet.spec.template.spec.applications || [],
    updatedFleet.applications,
  );
  allPatches = allPatches.concat(appPatches);

  // Systemd services
  const unitPatches = getStringListPatches(
    '/spec/template/spec/systemd',
    currentFleet.spec.template.spec.systemd?.matchPatterns || [],
    updatedFleet.systemdUnits.map((unit) => unit.pattern),
    (list) => ({ matchPatterns: list }),
  );
  allPatches = allPatches.concat(unitPatches);

  // Rollout policies
  const rolloutPolicyPatches = getRolloutPolicyPatches(currentFleet.spec.rolloutPolicy, updatedFleet.rolloutPolicy);
  allPatches = allPatches.concat(rolloutPolicyPatches);

  return allPatches;
};

export const getFleetResource = (values: FleetFormValues): Fleet => {
  const systemdPatterns =
    values.systemdUnits.length === 0
      ? undefined
      : {
          systemd: {
            matchPatterns: values.systemdUnits.map((unit) => unit.pattern),
          },
        };
  const fleet: Fleet = {
    apiVersion: API_VERSION,
    kind: 'Fleet',
    metadata: {
      name: values.name,
      labels: toAPILabel(values.fleetLabels),
    },
    spec: {
      selector: {
        matchLabels: toAPILabel(values.labels),
      },
      template: {
        metadata: {
          labels: {
            fleet: values.name,
          },
        },
        spec: {
          os: values.osImage ? { image: values.osImage || '' } : undefined,
          config: values.configTemplates.map(getAPIConfig),
          applications: values.applications.map(toAPIApplication),
          ...systemdPatterns,
        },
      },
      rolloutPolicy: getRolloutPolicyData(values.rolloutPolicy),
    },
  };

  if (values.registerMicroShift) {
    fleet.spec.template.spec.config?.push(ACMCrdConfig, ACMImportConfig, MicroshiftRegistrationHook);
  }

  return fleet;
};

export const getInitialValues = (fleet?: Fleet): FleetFormValues => {
  if (fleet) {
    const registerMicroShift = hasMicroshiftRegistrationConfig(fleet.spec.template.spec);
    return {
      name: fleet.metadata.name || '',
      labels: Object.keys(fleet.spec.selector?.matchLabels || {}).map((key) => ({
        key,
        value: fleet.spec.selector?.matchLabels?.[key],
      })),
      fleetLabels: Object.keys(fleet.metadata.labels || {}).map((key) => ({
        key,
        value: fleet.metadata.labels?.[key],
      })),
      osImage: fleet.spec.template.spec.os?.image || '',
      configTemplates: getConfigTemplatesValues(fleet.spec.template.spec, registerMicroShift),
      applications: getApplicationValues(fleet.spec.template.spec),
      systemdUnits: (fleet.spec.template.spec.systemd?.matchPatterns || []).map((p) => ({
        pattern: p,
        exists: true,
      })),
      registerMicroShift,
      rolloutPolicy: getRolloutPolicyValues(fleet.spec),
    };
  }

  return {
    name: '',
    labels: [],
    fleetLabels: [],
    osImage: '',
    configTemplates: [],
    applications: [],
    systemdUnits: [],
    registerMicroShift: false,
    rolloutPolicy: getRolloutPolicyValues(undefined),
  };
};
