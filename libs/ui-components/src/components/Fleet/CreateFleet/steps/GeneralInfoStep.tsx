import * as React from 'react';
import { FormGroup, Grid } from '@patternfly/react-core';
import { FormikErrors } from 'formik';

import { FleetFormValues } from '../../../../types/deviceSpec';
import { useTranslation } from '../../../../hooks/useTranslation';
import NameField from '../../../form/NameField';
import LabelsField from '../../../form/LabelsField';
import FlightCtlForm from '../../../form/FlightCtlForm';
import { getDnsSubdomainValidations } from '../../../form/validations';
import DeviceLabelSelector from './DeviceLabelSelector';

type GeneralInfoStepProps = {
  isReadOnly: boolean;
  isEdit: boolean;
};

export const generalInfoStepId = 'general-info';

export const isGeneralInfoStepValid = (errors: FormikErrors<FleetFormValues>) => {
  return !errors.name && !errors.labels && !errors.fleetLabels;
};

const GeneralInfoStep = ({ isEdit, isReadOnly }: GeneralInfoStepProps) => {
  const { t } = useTranslation();

  return (
    <Grid lg={5} span={8}>
      <FlightCtlForm>
        <NameField
          name="name"
          aria-label={t('Fleet name')}
          isRequired
          isDisabled={isEdit || isReadOnly}
          resourceType="fleets"
          validations={getDnsSubdomainValidations(t)}
        />
        <FormGroup label={t('Fleet labels')}>
          <LabelsField name="fleetLabels" isDisabled={isReadOnly} />
        </FormGroup>
        <FormGroup label={t('Device selector')}>
          <DeviceLabelSelector isReadOnly={isReadOnly} />
        </FormGroup>
      </FlightCtlForm>
    </Grid>
  );
};

export default GeneralInfoStep;
