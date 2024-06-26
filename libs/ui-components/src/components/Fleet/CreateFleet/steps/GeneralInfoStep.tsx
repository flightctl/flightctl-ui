import { Form, FormGroup, Grid } from '@patternfly/react-core';
import * as React from 'react';
import { FormikErrors } from 'formik';
import { FleetFormValues } from '../types';
import { useTranslation } from '../../../../hooks/useTranslation';
import NameField from '../../../form/NameField';
import LabelsField from '../../../form/LabelsField';
import { getDnsSubdomainValidations } from '../../../form/validations';

export const generalInfoStepId = 'general-info';

export const isGeneralInfoStepValid = (errors: FormikErrors<FleetFormValues>) => {
  return !errors.name && !errors.labels && !errors.fleetLabels;
};

const GeneralInfoStep = ({ isEdit }: { isEdit: boolean }) => {
  const { t } = useTranslation();

  return (
    <Grid lg={5} span={8}>
      <Form>
        <NameField
          name="name"
          aria-label={t('Name')}
          isRequired
          isDisabled={isEdit}
          resourceType="fleets"
          validations={getDnsSubdomainValidations(t)}
        />
        <FormGroup label={t('Fleet labels')}>
          <LabelsField name="fleetLabels" />
        </FormGroup>
        <FormGroup label={t('Device label selector')}>
          <LabelsField name="labels" />
        </FormGroup>
      </Form>
    </Grid>
  );
};

export default GeneralInfoStep;
