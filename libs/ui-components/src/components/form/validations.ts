import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { FlightCtlLabel } from '../../types/extraTypes';

type UnvalidatedLabel = Partial<FlightCtlLabel>;

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
