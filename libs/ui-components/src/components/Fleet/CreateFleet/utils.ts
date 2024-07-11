import { Fleet, PatchRequest } from '@flightctl/types';
import { TFunction } from 'i18next';
import * as Yup from 'yup';
import { FleetFormValues } from './types';
import { API_VERSION } from '../../../constants';
import { toAPILabel } from '../../../utils/labels';
import {
  maxLengthString,
  validConfigTemplatesSchema,
  validKubernetesDnsSubdomain,
  validLabelsSchema,
} from '../../form/validations';
import { appendJSONPatch, getLabelPatches } from '../../../utils/patch';
import {
  getAPIConfig,
  getConfigTemplatesValues,
  getDeviceSpecConfigPatches,
} from '../../Device/EditDeviceWizard/deviceSpecUtils';

export const getValidationSchema = (t: TFunction) => {
  return Yup.object<FleetFormValues>({
    name: validKubernetesDnsSubdomain(t, { isRequired: true }),
    osImage: maxLengthString(t, { fieldName: t('System image'), maxLength: 2048 }),
    fleetLabels: validLabelsSchema(t),
    labels: validLabelsSchema(t),
    configTemplates: validConfigTemplatesSchema(t),
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
  const configPatches = getDeviceSpecConfigPatches(currentConfigs, newConfigs, '/spec/template/spec/config');
  if (configPatches.length > 0) {
    return allPatches.concat(configPatches);
  }
  return allPatches;
};

export const getFleetResource = (values: FleetFormValues): Fleet => ({
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
      },
    },
  },
});

export const getInitialValues = (fleet?: Fleet): FleetFormValues =>
  fleet
    ? {
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
        configTemplates: getConfigTemplatesValues(fleet.spec.template.spec),
      }
    : {
        name: '',
        labels: [],
        fleetLabels: [],
        osImage: '',
        configTemplates: [],
      };
