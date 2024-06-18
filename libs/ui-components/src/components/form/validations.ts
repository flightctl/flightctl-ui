import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { FlightCtlLabel } from '../../types/extraTypes';

type UnvalidatedLabel = Partial<FlightCtlLabel>;

const SYSTEMD_PATTERNS_REGEXP = /^[a-z][a-z0-9-_.]*$/;
const SYSTEMD_UNITS_MAX_PATTERNS = 256;

export const maxLengthString = (t: TFunction, props: { maxLength: number; fieldName: string }) =>
  Yup.string().max(props.maxLength, t('{{ fieldName }} must not exceed {{ maxLength }} characters', props));

export const uniqueLabelKeysSchema = (t: TFunction) =>
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
      if (missingKeyLabels.length > 0) {
        return testContext.createError({
          message: t('Label keys are required. Invalid labels: {{invalidLabels}}', {
            invalidLabels: `=${missingKeyLabels.join(', =')}`,
          }),
        });
      }
      return true;
    })
    .test('unique keys', t('Label keys must be unique'), (labels: UnvalidatedLabel[]) => {
      const uniqueKeys = new Set(labels.map((label) => label.key));
      return uniqueKeys.size === labels.length;
    });

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
    displayName: conf.isSingleDevice
      ? Yup.string().required('Name is required.')
      : Yup.string()
          .matches(/{{n}}/, t('Device names must be unique. Add a number to the template to generate unique names.'))
          .required(t('Name is required.')),
    region: Yup.string().required(t('Region is required.')),
    labels: uniqueLabelKeysSchema(t),
  });

const K8S_LABEL_REGEXP = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;

export const validKubernetesLabel = (
  t: TFunction,
  { isRequired, fieldName }: { isRequired: boolean; fieldName?: string },
) =>
  isRequired
    ? maxLengthString(t, { maxLength: 63, fieldName: fieldName || t('Name') })
        .defined(t('{{ fieldName }} is required', { fieldName: fieldName || t('Name') }))
        .matches(K8S_LABEL_REGEXP, t('Invalid pattern'))
    : Yup.string();
