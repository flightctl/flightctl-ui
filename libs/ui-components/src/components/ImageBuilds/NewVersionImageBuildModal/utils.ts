import * as Yup from 'yup';
import { TFunction } from 'react-i18next';

import { getImageTagValidationError } from '../CreateImageBuildWizard/utils';
import { validImageBuildName } from '../../form/validations';

export type NewVersionFormValues = {
  name: string;
  sourceImageTag: string;
  destinationImageTag: string;
};

export const newVersionValidationSchema = (t: TFunction) => {
  return Yup.object<NewVersionFormValues>({
    name: validImageBuildName(t),
    sourceImageTag: Yup.string().test('oci-image-tag', function (value) {
      if (!value) return true;
      const error = getImageTagValidationError(value, t);
      return error ? this.createError({ message: error }) : true;
    }),
    destinationImageTag: Yup.string().test('oci-image-tag', function (value) {
      if (!value) return true;
      const error = getImageTagValidationError(value, t);
      return error ? this.createError({ message: error }) : true;
    }),
  });
};
