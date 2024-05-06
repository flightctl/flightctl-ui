import { Form, FormGroup, Grid } from '@patternfly/react-core';
import * as React from 'react';
import { FormikErrors, useFormikContext } from 'formik';
import { FleetFormValues } from '../types';
import { useTranslation } from '../../../../hooks/useTranslation';
import TextField from '../../../form/TextField';
import LabelsField from '../../../form/LabelsField';

export const generalInfoStepId = 'general-info';

export const isGeneralInfoStepValid = (errors: FormikErrors<FleetFormValues>) => {
  return !errors.name && !errors.labels && !errors.fleetLabels;
};

const GeneralInfoStep = ({ isEdit }: { isEdit: boolean }) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<FleetFormValues>();

  return (
    <Grid span={8}>
      <Form>
        <FormGroup label={t('Name')} isRequired>
          <TextField name="name" aria-label={t('Name')} value={values.name} isDisabled={isEdit} />
        </FormGroup>
        <FormGroup label={t('Fleet labels')}>
          <LabelsField labels={values.fleetLabels} setLabels={(newLabels) => setFieldValue('fleetLabels', newLabels)} />
        </FormGroup>
        <FormGroup label={t('Device label selector')}>
          <LabelsField labels={values.labels} setLabels={(newLabels) => setFieldValue('labels', newLabels)} />
        </FormGroup>
      </Form>
    </Grid>
  );
};

export default GeneralInfoStep;
