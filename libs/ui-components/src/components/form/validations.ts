import * as Yup from 'yup';
import { TFunction } from 'i18next';
import countBy from 'lodash/countBy';

import { FlightCtlLabel } from '../../types/extraTypes';
import {
  AppForm,
  AppSpecType,
  BatchForm,
  BatchLimitType,
  DisruptionBudgetForm,
  GitConfigTemplate,
  HttpConfigTemplate,
  ImageAppForm,
  InlineAppForm,
  InlineConfigTemplate,
  KubeSecretTemplate,
  RolloutPolicyForm,
  SpecConfigTemplate,
  SystemdUnitFormValue,
  UpdatePolicyForm,
  getAppIdentifier,
  isGitConfigTemplate,
  isHttpConfigTemplate,
  isInlineAppForm,
  isInlineConfigTemplate,
  isKubeSecretTemplate,
} from '../../types/deviceSpec';
import { labelToString } from '../../utils/labels';
import { UpdateScheduleMode } from '../../utils/time';

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

// https://issues.redhat.com/browse/MGMT-18349 to make the validation more robust
const BASIC_DEVICE_OS_IMAGE_REGEXP = /^[a-zA-Z0-9.\-\/:@_+]*$/;
const APPLICATION_IMAGE_REGEXP = BASIC_DEVICE_OS_IMAGE_REGEXP;
const APPLICATION_NAME_REGEXP = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
const APPLICATION_VAR_NAME_REGEXP = /^[a-zA-Z_]+[a-zA-Z0-9_]*$/;

const TEMPLATE_VARIABLES_REGEXP = /{{.+?}}/g;
// Special characters allowed: "dot", "pipe", "spaces" "quote", "backward slash", "underscore", "forward slash", "dash"
const TEMPLATE_VARIABLES_CONTENT_REGEXP = /^([.a-zA-Z0-9|\s"\\_\/-])+$/;
const TIME_VALUE_REGEXP = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;

const absolutePathRegex = /^\/.*$/;

// Accepts only relative paths. Rejects paths that start with "/", have multiple "/", or use dots (./file, ../parent/file), etc
const relativePathRegex = /^(?!\.\.\/|\.\.\$|\.\/)(\.\/)*[\w.-]+(?:\/[\w.-]+)*\/?$/;

export const MAX_TARGET_REVISION_LENGTH = 244;
const MAX_FILE_PATH_LENGTH = 253;

const isInteger = (val: number | undefined) => val === undefined || Number.isInteger(val);

export const getLabelValueValidations = (t: TFunction) => [
  { key: 'labelValueStartAndEnd', message: t('Starts and ends with a letter or a number.') },
  {
    key: 'labelValueAllowedChars',
    message: t('Contains only letters, numbers, dashes (-), dots (.), and underscores (_).'),
  },
  {
    key: 'labelValueMaxLength',
    message: t('1-{{ maxCharacters }} characters.', { maxCharacters: K8S_LABEL_VALUE_MAX_LENGTH }),
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
    message: t('1-{{ maxCharacters }} characters.', { maxCharacters: K8S_DNS_SUBDOMAIN_VALUE_MAX_LENGTH }),
  },
];

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

export const hasUniqueLabelKeys = (labels: FlightCtlLabel[]) => {
  const uniqueKeys = new Set(labels.map((label) => label.key));
  return uniqueKeys.size === labels.length;
};

export const getInvalidKubernetesLabels = (labels: FlightCtlLabel[]) => {
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

export const validOsImage = (t: TFunction, { isFleet }: { isFleet: boolean }) =>
  maxLengthString(t, { fieldName: t('System image'), maxLength: 2048 }).test(
    'osImageValidations',
    t('System image is invalid'),
    (osImage: string | undefined) => {
      if (!osImage) {
        return true;
      }

      let validateOsImage = osImage;
      if (isFleet) {
        // Extract template variables if they are present, they contain otherwise invalid characters
        const templateVariables = [...osImage.matchAll(TEMPLATE_VARIABLES_REGEXP)];
        if (templateVariables.length > 0) {
          const invalidVariables = templateVariables.filter(([match]) => {
            const content = match.slice(2, -2).trim(); // Remove the surrounding "{{" and "}}", and trim any extra whitespace
            return !content || !TEMPLATE_VARIABLES_CONTENT_REGEXP.test(content);
          });
          if (invalidVariables.length > 0) {
            return false;
          }
          validateOsImage = osImage.replace(TEMPLATE_VARIABLES_REGEXP, 'tv');
        }
      }

      return BASIC_DEVICE_OS_IMAGE_REGEXP.test(validateOsImage);
    },
  );

export const validLabelsSchema = (t: TFunction, forbiddenLabels?: string[]) =>
  Yup.array()
    .of(
      Yup.object<FlightCtlLabel>().shape({
        key: Yup.string()
          .required()
          .test('forbid labels', 'is forbidden', (key: string, testContext) => {
            if (forbiddenLabels?.length && forbiddenLabels.includes(key)) {
              return testContext.createError({
                path: 'labels',
                message: t('Label key "{{ forbiddenLabel }}" is forbidden', { forbiddenLabel: key }),
              });
            }
            return true;
          }),
        value: Yup.string(),
      }),
    )
    .required()
    .test('missing keys', (labels: FlightCtlLabel[], testContext) => {
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
    .test('invalid-labels', (labels: FlightCtlLabel[], testContext) => {
      const invalidLabels = getInvalidKubernetesLabels(labels);

      return invalidLabels.length > 0
        ? testContext.createError({
            message: t('The following labels are not valid Kubernetes labels: {{invalidLabels}}', {
              invalidLabels: `${invalidLabels.map(labelToString).join(', ')}`,
            }),
          })
        : true;
    });

export const validGroupLabelKeysSchema = (t: TFunction) =>
  Yup.array()
    .of(
      Yup.string()
        .required()
        .test('only-label-keys', t("Full labels are not allowed, use only the 'key' part."), (value?: string) => {
          return !value?.includes('=');
        }),
    )
    .test('unique keys', t('Label keys must be unique'), (labelKeys) => {
      const uniqueKeys = new Set(labelKeys);
      return uniqueKeys.size === labelKeys?.length;
    });

const appVariablesSchema = (t: TFunction) => {
  return Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string()
          .required(t('Variable name is required.'))
          .matches(APPLICATION_VAR_NAME_REGEXP, t('Use alphanumeric characters, or underscore (_)')),
        value: Yup.string().required(t('Variable value is required.')),
      }),
    )
    .required()
    .test('unique-vars-names', t('Variable names of an application must be unique'), (vars) => {
      const uniqueKeys = new Set(vars.map((varItem) => varItem.name));
      return uniqueKeys.size === vars?.length;
    });
};

const appSpecTypeSchema = (t: TFunction) =>
  Yup.string().oneOf([AppSpecType.INLINE, AppSpecType.OCI_IMAGE]).required(t('Application type is required'));

export const validApplicationsSchema = (t: TFunction) => {
  return Yup.array()
    .of(
      Yup.lazy((value: AppForm) => {
        if (isInlineAppForm(value)) {
          return Yup.object<InlineAppForm>().shape({
            specType: appSpecTypeSchema(t),
            name: Yup.string()
              .required(t('Name is required for inline applications.'))
              .matches(
                APPLICATION_NAME_REGEXP,
                t(
                  'Use lowercase alphanumeric characters, or dash (-). Must start and end with an alphanumeric character.',
                ),
              ),
            files: Yup.array()
              .of(
                Yup.object().shape({
                  content: Yup.string(),
                  path: Yup.string()
                    .required(t('File path is required'))
                    .max(
                      MAX_FILE_PATH_LENGTH,
                      t('File path length cannot exceed {{ maxCharacters }} characters.', {
                        maxCharacters: MAX_FILE_PATH_LENGTH,
                      }),
                    )
                    .matches(
                      relativePathRegex,
                      t('Application file path must be relative. It cannot be outside the application directory.'),
                    ),
                }),
              )
              .required()
              .min(1, t('Inline applications must include at least one file.'))
              .test('unique-file-paths', (files: InlineAppForm['files'], testContext) => {
                const duplicateFilePaths = Object.entries(countBy(files.map((file) => file.path)))
                  .filter(([, count]) => {
                    return count > 1;
                  })
                  .map(([filePath]) => filePath);

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const duplicateIndex = ((testContext.parent.files || []) as InlineAppForm['files']).findIndex((file) =>
                  duplicateFilePaths.includes(file.path),
                );
                if (duplicateIndex === -1) {
                  return true;
                }

                return testContext.createError({
                  path: `${testContext.path}[${duplicateIndex}].path`,
                  message: () => t('Each file of the same application must use different paths.'),
                });
              }),
            variables: appVariablesSchema(t),
          });
        }

        // Image applications
        return Yup.object<ImageAppForm>().shape({
          specType: appSpecTypeSchema(t),
          name: Yup.string().matches(
            APPLICATION_NAME_REGEXP,
            t('Use lowercase alphanumeric characters, or dash (-). Must start and end with an alphanumeric character.'),
          ),
          image: Yup.string()
            .required(t('Image is required.'))
            .matches(APPLICATION_IMAGE_REGEXP, t('Application image includes invalid characters.')),
          variables: appVariablesSchema(t),
        });
      }),
    )
    .test('unique-app-ids', (apps: AppForm[] | undefined, testContext) => {
      if (!apps?.length) {
        return true;
      }

      const appIds = apps.map(getAppIdentifier);
      const duplicateIds = Object.entries(countBy(appIds))
        .filter(([, count]) => {
          return count > 1;
        })
        .map(([id]) => id);
      if (duplicateIds.length === 0) {
        return true;
      }

      const errors = apps.reduce((errors, app, appIndex) => {
        if (duplicateIds.includes(appIds[appIndex])) {
          const error = app.name
            ? new Yup.ValidationError(t('Application name must be unique.'), '', `applications[${appIndex}].name`)
            : new Yup.ValidationError(
                t('Name is required, another application uses the same image.'),
                '',
                `applications[${appIndex}].name`,
              );

          errors.push(error);
        }
        return errors;
      }, [] as Yup.ValidationError[]);

      return testContext.createError({
        message: () => errors,
      });
    });
};

export const validFleetRolloutPolicySchema = (t: TFunction) => {
  return Yup.object()
    .shape({
      isAdvanced: Yup.boolean().required(),
      updateTimeout: Yup.number()
        .required('Update timeout is required')
        .test('not-decimal', t('Cannot be decimal'), isInteger),
      batches: Yup.array()
        .of(
          Yup.lazy((values: BatchForm) =>
            Yup.object<BatchForm>().shape({
              selector: validLabelsSchema(t),
              limitType: Yup.string()
                .oneOf([BatchLimitType.BatchLimitAbsoluteNumber, BatchLimitType.BatchLimitPercent])
                .required(),
              limit: Yup.number()
                .test('correct-percentage', t('Percentage must be between 1 and 100.'), (num) => {
                  if (num === undefined) {
                    return true;
                  }
                  if (values.limitType === BatchLimitType.BatchLimitPercent && num > 100) {
                    return false;
                  }
                  return true;
                })
                .test('not-decimal', t('Cannot be decimal'), isInteger)
                // When an absolute number, we can only restrict the minimum value
                .min(1, t('Value must be greater or equal than 1')),
              successThreshold: Yup.number()
                .required('Success threshold is required')
                .min(1, t('Success threshold must be between 1 and 100'))
                .max(100, t('Success threshold must be between 1 and 100'))
                .test('not-decimal', t('Cannot be decimal'), isInteger),
            }),
          ),
        )
        .required(),
    })
    .test('valid-rollout', (rolloutPolicy: RolloutPolicyForm | undefined, testContext) => {
      if (!rolloutPolicy || rolloutPolicy.batches.length === 0) {
        return true;
      }

      const errors = rolloutPolicy.batches.reduce((errors, batch, batchIndex) => {
        const hasError = batch.limit === undefined && batch.selector.length === 0;
        if (hasError) {
          errors.push(
            new Yup.ValidationError(
              t('At least one of the label selector or numeric selector must be specified.'),
              '',
              `rolloutPolicy.batches[${batchIndex}]`,
            ),
          );
        }
        return errors;
      }, [] as Yup.ValidationError[]);

      return testContext.createError({
        message: () => errors,
      });
    });
};

const requiredDownloadTimes = (t: TFunction, isStartTime: boolean) =>
  Yup.string().when(['isAdvanced', 'downloadAndInstallDiffer'], ([isAdvanced, downloadAndInstallDiffer]) => {
    if (!isAdvanced) {
      return Yup.string();
    }
    if (downloadAndInstallDiffer) {
      return Yup.string().required(
        isStartTime ? t('Downloading start time is required') : t('Downloading end time is required'),
      );
    }
    return Yup.string()
      .required(
        isStartTime
          ? t('Downloading and installing start times are required')
          : t('Downloading and installing end times are required'),
      )
      .matches(TIME_VALUE_REGEXP, t('Time must be in hh:mm with 24-hour format', { nsSeparator: '|' }));
  });

const requiredInstallTimes = (t: TFunction, isStartTime: boolean) =>
  Yup.string().when(['isAdvanced', 'downloadAndInstallDiffer'], ([isAdvanced, downloadAndInstallDiffer]) => {
    if (isAdvanced && downloadAndInstallDiffer) {
      return Yup.string()
        .required(isStartTime ? t('Installing start time is required') : t('Installing end time is required'))
        .matches(TIME_VALUE_REGEXP, t('Time must be in hh:mm with 24-hour format', { nsSeparator: '|' }));
    }
    return Yup.string();
  });

const updateWeekDaysSchema = (t: TFunction) =>
  Yup.array()
    .required()
    .of(Yup.boolean().required())
    .test(
      'selected weekdays',
      t('Select at least one day of the week for "weekly" schedules'),
      (selectedDays: boolean[], { path, parent }) => {
        const parentWeekMode =
          path === 'updatePolicy.downloadWeekDays'
            ? (parent as UpdatePolicyForm).downloadScheduleMode
            : (parent as UpdatePolicyForm).installScheduleMode;

        if (parentWeekMode === UpdateScheduleMode.Weekly) {
          return selectedDays.some(Boolean);
        }

        return true;
      },
    );

export const validUpdatePolicySchema = (t: TFunction) => {
  return Yup.object().shape({
    isAdvanced: Yup.boolean().required(),
    downloadAndInstallDiffer: Yup.boolean().required(),
    // Fields are flattened so "isAdvanced" can be used for validating them
    downloadStartsAt: requiredDownloadTimes(t, true),
    downloadEndsAt: requiredDownloadTimes(t, false),
    downloadScheduleMode: Yup.string().oneOf([UpdateScheduleMode.Weekly, UpdateScheduleMode.Daily]).required(),
    downloadWeekDays: updateWeekDaysSchema(t),
    downloadTimeZone: Yup.string().required(t('Select the timezone for downloading updates')),
    installStartsAt: requiredInstallTimes(t, true),
    installEndsAt: requiredInstallTimes(t, false),
    installScheduleMode: Yup.string().oneOf([UpdateScheduleMode.Weekly, UpdateScheduleMode.Daily]).required(),
    installWeekDays: updateWeekDaysSchema(t),
    installTimeZone: Yup.string().required(t('Select the timezone for installing updates')),
  });
};

export const validFleetDisruptionBudgetSchema = (t: TFunction) => {
  return Yup.object()
    .shape({
      isAdvanced: Yup.boolean().required(),
      minAvailable: Yup.number().test('not-decimal', t('Number of devices cannot be decimal'), isInteger),
      maxUnavailable: Yup.number().test('not-decimal', t('Number of devices cannot be decimal'), isInteger),
      groupBy: validGroupLabelKeysSchema(t),
    })
    .test(
      'has-min-or-max',
      t('At least one of minimum available or maximum unavailable devices is required.'),
      (value: DisruptionBudgetForm) =>
        !(value.isAdvanced && value.minAvailable === undefined && value.maxUnavailable === undefined),
    );
};

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
            repository: Yup.string().required(t('Repository is required.')),
            targetRevision: maxLengthString(t, {
              maxLength: MAX_TARGET_REVISION_LENGTH,
              fieldName: t('Target revision'),
            }).required(t('Branch/tag/commit is required.')),
          });
        } else if (isHttpConfigTemplate(value)) {
          return Yup.object<HttpConfigTemplate>().shape({
            type: Yup.string().required(t('Source type is required.')),
            repository: Yup.string().required(t('Repository is required.')),
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
            files: Yup.array().of(
              Yup.object<InlineConfigTemplate['files'][0]>().shape({
                path: Yup.string()
                  .required(t('Path is required.'))
                  .matches(absolutePathRegex, t('File path must be absolute.'))
                  .test(
                    'unique-paths',
                    t('File path must be unique.'),
                    (path) => !path || value.files.filter((file) => file.path === path).length == 1,
                  ),
                content: Yup.string(),
                permissions: Yup.string().test(
                  'permissions',
                  t('Permissions must use octal notation'),
                  (perm: string | undefined) => {
                    if (!perm) {
                      return true;
                    }
                    const valNum = Number(`0o${perm}`);
                    return Number.isFinite(valNum) && valNum >= 0 && valNum <= 0o7777;
                  },
                ),
              }),
            ),
          });
        }

        return Yup.object<InlineConfigTemplate>().shape({
          name: validKubernetesDnsSubdomain(t, { isRequired: true }),
          type: Yup.string().required(t('Source type is required.')),
        });
      }),
    );

export const systemdUnitListValidationSchema = (t: TFunction) =>
  Yup.array()
    .max(
      SYSTEMD_UNITS_MAX_PATTERNS,
      t('The maximum number of systemd units is {{maxSystemUnits}}.', { maxSystemUnits: SYSTEMD_UNITS_MAX_PATTERNS }),
    )
    .of(
      Yup.object<SystemdUnitFormValue>().shape({
        pattern: Yup.string().required('Service name is required'),
        exists: Yup.boolean().required(),
      }),
    )
    .test('invalid patterns', (systemdUnits: SystemdUnitFormValue[] | undefined, testContext) => {
      // TODO analyze https://github.com/systemd/systemd/blob/9cebda59e818cdb89dc1e53ab5bb51b91b3dc3ff/src/basic/unit-name.c#L42
      // and adjust the regular expression and / or the validation to accommodate for it
      const invalidSystemdUnits = (systemdUnits || [])
        .map((unit) => unit.pattern)
        .filter((pattern) => {
          return pattern.length > SYSTEMD_UNITS_MAX_PATTERNS || !SYSTEMD_PATTERNS_REGEXP.test(pattern);
        });
      if (invalidSystemdUnits.length === 0) {
        return true;
      }
      return testContext.createError({
        message: t('Invalid systemd service names: {{invalidPatterns}}', {
          invalidPatterns: invalidSystemdUnits.join(', '),
        }),
      });
    })
    .test(
      'unique patterns',
      t('Systemd service names must be unique'),
      (patterns: SystemdUnitFormValue[] | undefined) => {
        const uniqueKeys = new Set(patterns?.map((p) => p.pattern) || []);
        return uniqueKeys.size === (patterns?.length || 0);
      },
    );

export const deviceSystemdUnitsValidationSchema = (t: TFunction) =>
  Yup.object({
    systemdUnits: systemdUnitListValidationSchema(t),
  });

const forbiddenDeviceLabels = ['alias'];
export const deviceApprovalValidationSchema = (t: TFunction, conf: { isSingleDevice: boolean }) =>
  Yup.object({
    deviceAlias: conf.isSingleDevice
      ? validKubernetesLabelValue(t, { isRequired: false, fieldName: t('Alias') })
      : Yup.string().matches(
          /{{n}}/,
          t('Device aliases must be unique. Add a number to the template to generate unique aliases.'),
        ),
    labels: validLabelsSchema(t, forbiddenDeviceLabels),
  });
