import { Fleet, GitConfigProviderSpec, InlineConfigProviderSpec, KubernetesSecretProviderSpec } from '@flightctl/types';
import { TFunction } from 'i18next';
import * as Yup from 'yup';
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
import { maxLengthString, validKubernetesLabel, validLabelsSchema } from '../../form/validations';

const absolutePathRegex = /^\/.*$/;

export const getValidationSchema = (t: TFunction) => {
  return Yup.object<FleetFormValues>({
    name: validKubernetesLabel(t, { isRequired: true }),
    osImage: maxLengthString(t, { fieldName: t('System image'), maxLength: 2048 }),
    fleetLabels: validLabelsSchema(t),
    labels: validLabelsSchema(t),
    configTemplates: Yup.array().of(
      Yup.lazy((value: FleetConfigTemplate) => {
        if (isGitConfigTemplate(value)) {
          return Yup.object<GitConfigTemplate>().shape({
            type: Yup.string().required(t('Provider type is required.')),
            name: validKubernetesLabel(t, { isRequired: true }),
            path: Yup.string().required(t('Path is required.')).matches(absolutePathRegex, t('Path must be absolute.')),
            repository: Yup.string().required(t('Repository is required.')),
            targetRevision: Yup.string().required(t('Branch/tag/commit is required.')),
          });
        } else if (isKubeSecretTemplate(value)) {
          return Yup.object<KubeSecretTemplate>().shape({
            type: Yup.string().required(t('Provider type is required.')),
            name: validKubernetesLabel(t, { isRequired: true }),
            secretName: Yup.string().required(t('Secret name is required.')),
            secretNs: Yup.string().required(t('Secret namespace is required.')),
            mountPath: Yup.string()
              .required(t('Mount path is required.'))
              .matches(absolutePathRegex, t('Mount path must be absolute.')),
          });
        } else if (isInlineConfigTemplate(value)) {
          return Yup.object<InlineConfigTemplate>().shape({
            type: Yup.string().required(t('Provider type is required.')),
            name: validKubernetesLabel(t, { isRequired: true }),
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
