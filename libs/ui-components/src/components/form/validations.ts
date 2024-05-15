import * as Yup from 'yup';
import { TFunction } from 'i18next';

import { FlightCtlLabel } from '../../types/extraTypes';

export const uniqueLabelKeysSchema = (t: TFunction) =>
  Yup.array()
    .of(
      Yup.object<FlightCtlLabel>().shape({
        key: Yup.string().required(),
        value: Yup.string(),
      }),
    )
    .required()
    .test('unique keys', t('Label keys must be unique'), (labels: FlightCtlLabel[]) => {
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
