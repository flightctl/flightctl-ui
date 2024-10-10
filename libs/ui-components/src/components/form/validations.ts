import * as Yup from 'yup';
import { TFunction } from 'i18next';
import * as yaml from 'js-yaml';

import { FlightCtlLabel } from '../../types/extraTypes';
import {
  GitConfigTemplate,
  HttpConfigTemplate,
  InlineConfigTemplate,
  KubeSecretTemplate,
  SpecConfigTemplate,
  isGitConfigTemplate,
  isHttpConfigTemplate,
  isInlineConfigTemplate,
  isKubeSecretTemplate,
} from '../../types/deviceSpec';

import { labelToString } from '../../utils/labels';

type UnvalidatedLabel = Partial<FlightCtlLabel>;

const SYSTEMD_PATTERNS_REGEXP = /^[a-z][a-z0-9-_.]*$/;
const SYSTEMD_UNITS_MAX_PATTERNS = 256;

// Accepts uppercase characters, and "underscore" symbols
const K8S_LABEL_VALUE_START_END = /^[a-z0-9A-Z](.*[a-z0-9A-Z])?$/;
const K8S_LABEL_VALUE_ALLOWED_CHARACTERS = /^[a-z0-9A-Z._-]*$/;
const K8S_LABEL_VALUE_MAX_LENGTH = 63;

// Does not accept uppercase characters, nor "underscore" symbols
const K8S_DNS_SUBDOMAIN_START_END = /^[a-z0-9](.*[a-z0-9])?$/;
const K8S_DNS_SUBDOMAIN_ALLOWED_CHARACTERS = /^[a-z0-9.-]*$/;
const K8S_DNS_SUBDOMAIN_VALUE_MAX_LENGTH = 253;

const absolutePathRegex = /^\/.*$/;
export const MAX_TARGET_REVISION_LENGTH = 244;

export const getLabelValueValidations = (t: TFunction) => [
  { key: 'labelValueStartAndEnd', message: t('Starts and ends with a letter or a number.') },
  {
    key: 'labelValueAllowedChars',
    message: t('Contains only letters, numbers, dashes (-), dots (.), and underscores (_).'),
  },
  {
    key: 'labelValueMaxLength',
    message: t('1-{{ maxCharacters }} characters', { maxCharacters: K8S_LABEL_VALUE_MAX_LENGTH }),
  },
];

export const getDnsSubdomainValidations = (t: TFunction) => [
  { key: 'dnsSubdomainStartAndEnd', message: t('Starts and ends with a lowercase letter or a number.') },
  {
    key: 'dnsSubdomainAllowedChars',
    message: t('Contains only lowercase letters, numbers, dashes (-), and dots (.).'),
  },
  {
    key: 'dnsSubdomainMaxLength',
    message: t('1-{{ maxCharacters }} characters', { maxCharacters: K8S_DNS_SUBDOMAIN_VALUE_MAX_LENGTH }),
  },
];

export const getKubernetesLabelValueErrors = (labelValue: string) => {
  const errorKeys: Record<string, string> = {};
  if (!K8S_LABEL_VALUE_START_END.test(labelValue)) {
    errorKeys.labelValueStartAndEnd = 'failed';
  }
  if (!K8S_LABEL_VALUE_ALLOWED_CHARACTERS.test(labelValue)) {
    errorKeys.labelValueAllowedChars = 'failed';
  }
  if (labelValue?.length > K8S_LABEL_VALUE_MAX_LENGTH) {
    errorKeys.labelValueMaxLength = 'failed';
  }
  return errorKeys;
};

export const getKubernetesDnsSubdomainErrors = (value: string) => {
  const errorKeys: Record<string, string> = {};
  if (!K8S_DNS_SUBDOMAIN_START_END.test(value)) {
    errorKeys.dnsSubdomainStartAndEnd = 'failed';
  }
  if (!K8S_DNS_SUBDOMAIN_ALLOWED_CHARACTERS.test(value)) {
    errorKeys.dnsSubdomainAllowedChars = 'failed';
  }
  if (value?.length > K8S_DNS_SUBDOMAIN_VALUE_MAX_LENGTH) {
    errorKeys.dnsSubdomainMaxLength = 'failed';
  }
  return errorKeys;
};

export const hasUniqueLabelKeys = (labels: UnvalidatedLabel[]) => {
  const uniqueKeys = new Set(labels.map((label) => label.key));
  return uniqueKeys.size === labels.length;
};

export const getInvalidKubernetesLabels = (labels: UnvalidatedLabel[]) => {
  return labels.filter((unvalidatedLabel) => {
    const key = unvalidatedLabel.key || '';
    const value = unvalidatedLabel.value || '';

    const keyParts = key.split('/');
    if (keyParts.length > 2) {
      return true;
    }

    // Key prefix validations
    const keyPrefix = keyParts.length === 2 ? keyParts[0] : '';
    if (keyPrefix) {
      if (
        keyPrefix.length > K8S_DNS_SUBDOMAIN_VALUE_MAX_LENGTH ||
        !K8S_DNS_SUBDOMAIN_START_END.test(keyPrefix) ||
        !K8S_DNS_SUBDOMAIN_ALLOWED_CHARACTERS.test(keyPrefix)
      ) {
        return true;
      }
    }

    // Key name validations
    const keyName = keyPrefix ? keyParts[1] : key;
    if (
      keyName.length > K8S_LABEL_VALUE_MAX_LENGTH ||
      !K8S_LABEL_VALUE_START_END.test(keyName) ||
      !K8S_LABEL_VALUE_ALLOWED_CHARACTERS.test(keyName)
    ) {
      return true;
    }

    // Value validations
    return value.length === 0
      ? false
      : value.length > K8S_LABEL_VALUE_MAX_LENGTH ||
          !K8S_LABEL_VALUE_START_END.test(value) ||
          !K8S_LABEL_VALUE_ALLOWED_CHARACTERS.test(value);
  });
};

export const validKubernetesDnsSubdomain = (
  t: TFunction,
  { isRequired, fieldName }: { isRequired: boolean; fieldName?: string },
) =>
  isRequired
    ? Yup.string()
        .defined(t('{{ fieldName }} is required', { fieldName: fieldName || t('Name') }))
        .test('k8sDnsSubdomainFormat', (value: string, testContext) => {
          const errorKeys = getKubernetesDnsSubdomainErrors(value);
          return Object.keys(errorKeys).length > 0
            ? testContext.createError({
                message: errorKeys,
              })
            : true;
        })
    : Yup.string();

const labelValueValidations = (labelValue: string | undefined, testContext: Yup.TestContext) => {
  if (!labelValue) {
    return true;
  }
  const errorKeys: Partial<Record<string, string>> = {};
  if (!K8S_LABEL_VALUE_START_END.test(labelValue)) {
    errorKeys.labelValueStartAndEnd = 'failed';
  }
  if (!K8S_LABEL_VALUE_ALLOWED_CHARACTERS.test(labelValue)) {
    errorKeys.labelValueAllowedChars = 'failed';
  }
  if (labelValue.length > K8S_LABEL_VALUE_MAX_LENGTH) {
    errorKeys.labelValueMaxLength = 'failed';
  }
  if (Object.keys(errorKeys).length === 0) {
    return true;
  }
  return testContext.createError({
    message: errorKeys,
  });
};

export const validKubernetesLabelValue = (
  t: TFunction,
  { isRequired, fieldName }: { isRequired: boolean; fieldName?: string },
) =>
  isRequired
    ? Yup.string()
        .required(t('{{ fieldName }} is required', { fieldName: fieldName || t('Name') }))
        .test('k8sLabelValueFormat', labelValueValidations)
    : Yup.string().test('k8sLabelValueFormat', labelValueValidations);

export const maxLengthString = (t: TFunction, props: { maxLength: number; fieldName: string }) =>
  Yup.string().max(props.maxLength, t('{{ fieldName }} must not exceed {{ maxLength }} characters', props));

export const validLabelsSchema = (t: TFunction) =>
  Yup.array()
    .of(
      Yup.object<UnvalidatedLabel>().shape({
        // We'll define the mandatory key restriction for all labels, not individually
        key: Yup.string(),
        value: Yup.string(),
      }),
    )
    .required()
    .test('missing keys', (labels: UnvalidatedLabel[], testContext) => {
      const missingKeyLabels = labels.filter((label) => !label.key).map((label) => label.value);
      return missingKeyLabels.length > 0
        ? testContext.createError({
            message: t('Label keys are required. Invalid labels: {{invalidLabels}}', {
              invalidLabels: `=${missingKeyLabels.join(', =')}`,
            }),
          })
        : true;
    })
    .test('unique keys', t('Label keys must be unique'), hasUniqueLabelKeys)
    .test('invalid-labels', (labels: UnvalidatedLabel[], testContext) => {
      const invalidLabels = getInvalidKubernetesLabels(labels);

      return invalidLabels.length > 0
        ? testContext.createError({
            message: t('The following labels are not valid Kubernetes labels: {{invalidLabels}}', {
              invalidLabels: `${invalidLabels.map((label) => labelToString(label as FlightCtlLabel)).join(', ')}`,
            }),
          })
        : true;
    });

export const validConfigTemplatesSchema = (t: TFunction) =>
  Yup.array()
    .test('unique-names', t('Source names must be unique'), (templates: SpecConfigTemplate[] | undefined) => {
      if (!templates) {
        return true;
      }
      const uniqueNames = new Set(templates.map((template) => template.name));
      return uniqueNames.size === templates.length;
    })
    .of(
      Yup.lazy((value: SpecConfigTemplate) => {
        if (isGitConfigTemplate(value)) {
          return Yup.object<GitConfigTemplate>().shape({
            type: Yup.string().required(t('Source type is required.')),
            name: validKubernetesDnsSubdomain(t, { isRequired: true }),
            path: Yup.string().required(t('Path is required.')).matches(absolutePathRegex, t('Path must be absolute.')),
            mountPath: Yup.string()
              .required(t('Mount path is required.'))
              .matches(absolutePathRegex, t('Mount path must be absolute.')),
            repository: Yup.string().required(t('Repository is required.')),
            targetRevision: maxLengthString(t, {
              maxLength: MAX_TARGET_REVISION_LENGTH,
              fieldName: t('Target revision'),
            }).required(t('Branch/tag/commit is required.')),
          });
        } else if (isHttpConfigTemplate(value)) {
          return Yup.object<HttpConfigTemplate>().shape({
            type: Yup.string().required(t('Source type is required.')),
            name: validKubernetesDnsSubdomain(t, { isRequired: true }),
            filePath: Yup.string()
              .required(t('File path is required.'))
              .matches(absolutePathRegex, t('Path must be absolute.')),
            suffix: Yup.string(),
          });
        } else if (isKubeSecretTemplate(value)) {
          return Yup.object<KubeSecretTemplate>().shape({
            type: Yup.string().required(t('Source type is required.')),
            name: validKubernetesDnsSubdomain(t, { isRequired: true }),
            secretName: Yup.string().required(t('Secret name is required.')),
            secretNs: Yup.string().required(t('Secret namespace is required.')),
            mountPath: Yup.string()
              .required(t('Mount path is required.'))
              .matches(absolutePathRegex, t('Mount path must be absolute.')),
          });
        } else if (isInlineConfigTemplate(value)) {
          return Yup.object<InlineConfigTemplate>().shape({
            type: Yup.string().required(t('Source type is required.')),
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
          name: validKubernetesDnsSubdomain(t, { isRequired: true }),
          type: Yup.string().required(t('Source type is required.')),
        });
      }),
    );

export const deviceSystemdUnitsValidationSchema = (t: TFunction) =>
  Yup.object({
    matchPatterns: Yup.array()
      .max(
        SYSTEMD_UNITS_MAX_PATTERNS,
        t('The maximum number of systemd units is {{maxSystemUnits}}.', { maxSystemUnits: SYSTEMD_UNITS_MAX_PATTERNS }),
      )
      .of(Yup.string().required('Unit name is required.'))
      .test('invalid patterns', (patterns: string[] | undefined, testContext) => {
        // TODO analyze https://github.com/systemd/systemd/blob/9cebda59e818cdb89dc1e53ab5bb51b91b3dc3ff/src/basic/unit-name.c#L42
        // and adjust the regular expression and / or the validation to accommodate for it
        const invalidPatterns = (patterns || []).filter((pattern) => {
          return pattern.length > SYSTEMD_UNITS_MAX_PATTERNS || !SYSTEMD_PATTERNS_REGEXP.test(pattern);
        });
        if (invalidPatterns.length === 0) {
          return true;
        }
        return testContext.createError({
          message: t('Invalid systemd unit names: {{invalidPatterns}}', {
            invalidPatterns: invalidPatterns.join(', '),
          }),
        });
      })
      .test('unique patterns', t('Systemd unit names must be unique'), (patterns: string[] | undefined) => {
        const uniqueKeys = new Set(patterns || []);
        return uniqueKeys.size === (patterns?.length || 0);
      }),
  });

export const deviceApprovalValidationSchema = (t: TFunction, conf: { isSingleDevice: boolean }) =>
  Yup.object({
    deviceAlias: conf.isSingleDevice
      ? validKubernetesLabelValue(t, { isRequired: false, fieldName: t('Alias') })
      : Yup.string().matches(
          /{{n}}/,
          t('Device aliases must be unique. Add a number to the template to generate unique aliases.'),
        ),
    labels: validLabelsSchema(t),
  });
