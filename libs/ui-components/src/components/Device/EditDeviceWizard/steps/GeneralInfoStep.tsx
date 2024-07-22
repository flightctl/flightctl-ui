import * as React from 'react';
import { Form, FormGroup, Grid } from '@patternfly/react-core';
import { FormikErrors } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import LabelsField from '../../../form/LabelsField';
import RichValidationTextField from '../../../form/RichValidationTextField';
import { getLabelValueValidations } from '../../../form/validations';
import { EditDeviceFormValues } from '../types';

export const generalInfoStepId = 'general-info';

export const isGeneralInfoStepValid = (errors: FormikErrors<EditDeviceFormValues>) => {
  return !errors.deviceAlias && !errors.labels;
};

const GeneralInfoStep = () => {
  const { t } = useTranslation();

  return (
    <Grid lg={5} span={8}>
      <Form>
        <RichValidationTextField
          fieldName="deviceAlias"
          aria-label={t('Alias')}
          validations={getLabelValueValidations(t)}
        />
        <FormGroup label={t('Device labels')}>
          <LabelsField name="labels" />
        </FormGroup>
      </Form>
    </Grid>
  );
};

export default GeneralInfoStep;
