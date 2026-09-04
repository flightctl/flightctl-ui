import { type TFunction } from 'i18next';
import * as Yup from 'yup';
import { ApiVersion, type Fleet, type PatchRequest } from '@flightctl/types';
import { toAPILabel } from '../../../utils/labels';
import {
  systemdUnitListValidationSchema,
  validApplicationsSchema,
  validConfigTemplatesSchema,
  validFleetDisruptionBudgetSchema,
  validFleetRolloutPolicySchema,
  validKubernetesDnsSubdomain,
  validLabelsSchema,
  validOsFormValue,
  validUpdatePolicySchema,
} from '../../form/validations';
import {
  getLabelPatches,
  getRolloutPolicyData,
  getRolloutPolicyPatches,
  getStringListPatches,
  getUpdatePolicyPatches,
  updatePolicyFormToApi,
} from '../../../utils/patch';
import {
  ACMCrdConfig,
  ACMImportConfig,
  MicroshiftRegistrationHook,
  getApiConfig,
  getApplicationPatches,
  getApplicationValues,
  getConfigTemplatesValues,
  getDeviceSpecConfigPatches,
  getFormOsSpecPatches,
  getSystemdUnitsValues,
  hasMicroshiftRegistrationConfig,
  toApiApplication,
} from '../../Device/EditDeviceWizard/deviceSpecUtils';
import { getDisruptionBudgetValues, getRolloutPolicyValues, getUpdatePolicyValues } from './fleetSpecUtils';
import { type FleetFormValues, UpdateMode, type UpdatePolicyForm } from '../../../types/deviceSpec';

export const getValidationSchema = (t: TFunction) => {
  return Yup.lazy((values: FleetFormValues) => {
    const hasCustomUpdates = values.updateMode === UpdateMode.Customized;
    return Yup.object<FleetFormValues>({
      name: validKubernetesDnsSubdomain(t, { isRequired: true }),
      osSpec: validOsFormValue(t, { isFleet: true }),
      fleetLabels: validLabelsSchema(t),
      labels: validLabelsSchema(t),
      configTemplates: validConfigTemplatesSchema(t),
      applications: validApplicationsSchema(t),
      systemdUnits: systemdUnitListValidationSchema(t),
      rolloutPolicy:
        hasCustomUpdates && values.rolloutPolicy?.isCustomized ? validFleetRolloutPolicySchema(t) : Yup.object(),
      disruptionBudget:
        hasCustomUpdates && values.disruptionBudget?.isCustomized ? validFleetDisruptionBudgetSchema(t) : Yup.object(),
      updatePolicy: hasCustomUpdates && values.updatePolicy?.isCustomized ? validUpdatePolicySchema(t) : Yup.object(),
    });
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
  const currentDeviceSelectLabelCount = Object.keys(currentDeviceSelectLabels).length;

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
  } else if (currentDeviceSelectLabelCount > 0) {
    allPatches.push({
      path: '/spec/selector',
      op: 'remove',
    });
  }

  // OS patches. ATM only the image can be modified via the Fleet form.
  allPatches = allPatches.concat(
    getFormOsSpecPatches('/spec/template/spec/os', currentFleet.spec.template.spec.os, updatedFleet.osSpec),
  );

  // Configurations
  const currentConfigs = currentFleet.spec.template.spec.config || [];
  const newConfigs = updatedFleet.configTemplates.map(getApiConfig);
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

  // Rollout policies (includes disruption budget)
  const rolloutPolicyPatches = getRolloutPolicyPatches(currentFleet.spec.rolloutPolicy, updatedFleet);
  allPatches = allPatches.concat(rolloutPolicyPatches);

  // Update policies
  const updatePolicyPatches = getUpdatePolicyPatches(
    '/spec/template/spec/updatePolicy',
    currentFleet.spec.template.spec.updatePolicy,
    {
      ...updatedFleet.updatePolicy,
      isCustomized: updatedFleet.updateMode === UpdateMode.Customized && updatedFleet.updatePolicy.isCustomized,
    } as Required<UpdatePolicyForm>,
  );
  allPatches = allPatches.concat(updatePolicyPatches);
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

  const isOsSet = Boolean(values.osSpec?.image) || Boolean(values.osSpec?.catalogItemRef);
  const fleet: Fleet = {
    apiVersion: ApiVersion.ApiVersionV1beta1,
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
          os: isOsSet ? values.osSpec : undefined,
          config: values.configTemplates.map(getApiConfig),
          applications: values.applications.map(toApiApplication),
          ...systemdPatterns,
        },
      },
    },
  };

  if (values.registerMicroShift) {
    fleet.spec.template.spec.config?.push(ACMCrdConfig, ACMImportConfig, MicroshiftRegistrationHook);
  }
  if (values.updateMode === UpdateMode.Customized) {
    if (values.rolloutPolicy.isCustomized || values.disruptionBudget.isCustomized) {
      fleet.spec.rolloutPolicy = getRolloutPolicyData(values);
    }
    if (values.updatePolicy.isCustomized) {
      fleet.spec.template.spec.updatePolicy = updatePolicyFormToApi(values.updatePolicy as Required<UpdatePolicyForm>);
    }
  }
  return fleet;
};

export const getInitialValues = (fleet?: Fleet): FleetFormValues => {
  if (fleet) {
    const registerMicroShift = hasMicroshiftRegistrationConfig(fleet.spec.template.spec);
    const rolloutPolicy = getRolloutPolicyValues(fleet.spec);
    const disruptionBudget = getDisruptionBudgetValues(fleet.spec);
    const updatePolicy = getUpdatePolicyValues(fleet.spec.template?.spec?.updatePolicy);

    const isCustomUpdateMode = rolloutPolicy.isCustomized || disruptionBudget.isCustomized || updatePolicy.isCustomized;
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
      osSpec: fleet.spec.template.spec.os,
      configTemplates: getConfigTemplatesValues(fleet.spec.template.spec, registerMicroShift),
      applications: getApplicationValues(fleet.spec.template.spec),
      systemdUnits: getSystemdUnitsValues(fleet.spec.template.spec),
      registerMicroShift,
      rolloutPolicy,
      disruptionBudget,
      updatePolicy,
      updateMode: isCustomUpdateMode ? UpdateMode.Customized : UpdateMode.Default,
    };
  }

  return {
    name: '',
    labels: [],
    fleetLabels: [],
    osSpec: { image: '' },
    configTemplates: [],
    applications: [],
    systemdUnits: [],
    registerMicroShift: false,
    rolloutPolicy: getRolloutPolicyValues(undefined),
    disruptionBudget: getDisruptionBudgetValues(undefined),
    updatePolicy: getUpdatePolicyValues(undefined),
    updateMode: UpdateMode.Default,
  };
};
