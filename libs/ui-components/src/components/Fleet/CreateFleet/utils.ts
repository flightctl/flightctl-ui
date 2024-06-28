import {
  Fleet,
  GitConfigProviderSpec,
  InlineConfigProviderSpec,
  KubernetesSecretProviderSpec,
  PatchRequest,
} from '@flightctl/types';
import { TFunction } from 'i18next';
import * as Yup from 'yup';
import isEqual from 'lodash/isEqual';
import * as yaml from 'js-yaml';
import {
  FleetConfigTemplate,
  FleetFormValues,
  GitConfigTemplate,
  InlineConfigTemplate,
  KubeSecretTemplate,
  isGitConfigTemplate,
  isGitProviderSpec,
  isInlineConfigTemplate,
  isKubeProviderSpec,
  isKubeSecretTemplate,
} from './types';
import { API_VERSION } from '../../../constants';
import { toAPILabel } from '../../../utils/labels';
import { maxLengthString, validKubernetesDnsSubdomain, validLabelsSchema } from '../../form/validations';
import { appendJSONPatch, getLabelPatches } from '../../../utils/patch';

const absolutePathRegex = /^\/.*$/;

export const getValidationSchema = (t: TFunction) => {
  return Yup.object<FleetFormValues>({
    name: validKubernetesDnsSubdomain(t, { isRequired: true }),
    osImage: maxLengthString(t, { fieldName: t('System image'), maxLength: 2048 }),
    fleetLabels: validLabelsSchema(t),
    labels: validLabelsSchema(t),
    configTemplates: Yup.array().of(
      Yup.lazy((value: FleetConfigTemplate) => {
        if (isGitConfigTemplate(value)) {
          return Yup.object<GitConfigTemplate>().shape({
            type: Yup.string().required(t('Provider type is required.')),
            name: validKubernetesDnsSubdomain(t, { isRequired: true }),
            path: Yup.string().required(t('Path is required.')).matches(absolutePathRegex, t('Path must be absolute.')),
            repository: Yup.string().required(t('Repository is required.')),
            targetRevision: Yup.string().required(t('Branch/tag/commit is required.')),
          });
        } else if (isKubeSecretTemplate(value)) {
          return Yup.object<KubeSecretTemplate>().shape({
            type: Yup.string().required(t('Provider type is required.')),
            name: validKubernetesDnsSubdomain(t, { isRequired: true }),
            secretName: Yup.string().required(t('Secret name is required.')),
            secretNs: Yup.string().required(t('Secret namespace is required.')),
            mountPath: Yup.string()
              .required(t('Mount path is required.'))
              .matches(absolutePathRegex, t('Mount path must be absolute.')),
          });
        } else if (isInlineConfigTemplate(value)) {
          return Yup.object<InlineConfigTemplate>().shape({
            type: Yup.string().required(t('Provider type is required.')),
            name: validKubernetesDnsSubdomain(t, { isRequired: true }),
            inline: maxLengthString(t, { fieldName: t('Inline config'), maxLength: 65535 })
              .required(t('Inline config is required.'))
              .test('yaml object', t('Inline config must be a valid yaml object.'), (value) => {
                try {
                  const yamlResult = yaml.load(value);
                  return typeof yamlResult === 'object';
                } catch (err) {
                  return false;
                }
              }),
          });
        }

        return Yup.object<InlineConfigTemplate>().shape({
          type: Yup.string().required(t('Provider type is required.')),
          name: Yup.string().required(t('Name is required.')),
        });
      }),
    ),
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

  const deviceSelectLabelPatches = getLabelPatches(
    '/spec/selector/matchLabels',
    currentDeviceSelectLabels,
    updatedDeviceSelectLabels,
  );
  allPatches = allPatches.concat(deviceSelectLabelPatches);

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
  if (currentConfigs.length === 0 && newConfigs.length > 0) {
    allPatches.push({
      path: '/spec/template/spec/config',
      op: 'add',
      value: newConfigs,
    });
  } else if (currentConfigs.length > 0 && newConfigs.length === 0) {
    allPatches.push({
      path: '/spec/template/spec/config',
      op: 'remove',
    });
  } else if (currentConfigs.length !== newConfigs.length) {
    allPatches.push({
      path: '/spec/template/spec/config',
      op: 'replace',
      value: newConfigs,
    });
  } else {
    const hasConfigChanges = newConfigs.some((newConfig) => {
      // Attempts to find a new config which has been changed from "currentConfigs"
      const isUnchanged = currentConfigs.some((conf) => {
        if (conf.configType !== newConfig.configType) {
          return false;
        }
        switch (conf.configType) {
          case 'GitConfigProviderSpec':
            return isSameGitConf(newConfig as GitConfigProviderSpec, conf as GitConfigProviderSpec);
          case 'KubernetesSecretProviderSpec':
            return isSameSecretConf(newConfig as KubernetesSecretProviderSpec, conf as KubernetesSecretProviderSpec);
          case 'InlineConfigProviderSpec':
            return isSameInlineConf(newConfig as InlineConfigProviderSpec, conf as InlineConfigProviderSpec);
        }
        return false;
      });

      return !isUnchanged;
    });

    if (hasConfigChanges) {
      allPatches.push({
        path: '/spec/template/spec/config',
        op: 'replace',
        value: newConfigs,
      });
    }
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

const isSameGitConf = (a: GitConfigProviderSpec, b: GitConfigProviderSpec) => {
  const aRef = a.gitRef;
  const bRef = b.gitRef;
  return (
    a.name === b.name &&
    aRef.path === bRef.path &&
    aRef.repository === bRef.repository &&
    aRef.targetRevision === bRef.targetRevision
  );
};

const isSameSecretConf = (a: KubernetesSecretProviderSpec, b: KubernetesSecretProviderSpec) => {
  const aRef = a.secretRef;
  const bRef = b.secretRef;
  return (
    a.name === b.name &&
    aRef.name === bRef.name &&
    aRef.namespace === bRef.namespace &&
    aRef.mountPath === bRef.mountPath
  );
};

const isSameInlineConf = (a: InlineConfigProviderSpec, b: InlineConfigProviderSpec) => {
  return a.name === b.name && isEqual(a.inline, b.inline);
};

export const getAPIConfig = (
  ct: FleetConfigTemplate,
): GitConfigProviderSpec | KubernetesSecretProviderSpec | InlineConfigProviderSpec => {
  if (isGitConfigTemplate(ct)) {
    return {
      configType: 'GitConfigProviderSpec',
      name: ct.name,
      gitRef: {
        path: ct.path,
        repository: ct.repository,
        targetRevision: ct.targetRevision,
      },
    };
  }
  if (isKubeSecretTemplate(ct)) {
    return {
      configType: 'KubernetesSecretProviderSpec',
      name: ct.name,
      secretRef: {
        mountPath: ct.mountPath,
        name: ct.secretName,
        namespace: ct.secretNs,
      },
    };
  }
  return {
    configType: 'InlineConfigProviderSpec',
    inline: yaml.load(ct.inline) as InlineConfigProviderSpec['inline'],
    name: ct.name,
  };
};

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
        configTemplates:
          fleet.spec.template.spec.config?.map<FleetConfigTemplate>((c) => {
            if (isGitProviderSpec(c)) {
              return {
                type: 'git',
                name: c.name,
                path: c.gitRef.path,
                repository: c.gitRef.repository,
                targetRevision: c.gitRef.targetRevision,
              } as GitConfigTemplate;
            }
            if (isKubeProviderSpec(c)) {
              return {
                type: 'secret',
                name: c.name,
                mountPath: c.secretRef.mountPath,
                secretName: c.secretRef.name,
                secretNs: c.secretRef.namespace,
              } as KubeSecretTemplate;
            }
            return {
              type: 'inline',
              name: c.name,
              inline: yaml.dump(c.inline),
            } as InlineConfigTemplate;
          }) || [],
      }
    : {
        name: '',
        labels: [],
        fleetLabels: [],
        osImage: '',
        configTemplates: [],
      };
