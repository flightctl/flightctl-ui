import { Form, FormGroup, Grid } from '@patternfly/react-core';
import * as React from 'react';
import { FormikErrors } from 'formik';
import { FleetFormValues } from '../types';
import { useTranslation } from '../../../../hooks/useTranslation';
import NameField from '../../../form/NameField';
import LabelsField from '../../../form/LabelsField';
import { KubernetesLabelHelperText } from '../../../common/HelperTextItems';

export const generalInfoStepId = 'general-info';

export const isGeneralInfoStepValid = (errors: FormikErrors<FleetFormValues>) => {
  return !errors.name && !errors.labels && !errors.fleetLabels;
};

const GeneralInfoStep = ({ isEdit }: { isEdit: boolean }) => {
  const { t } = useTranslation();
  return (
    <Grid span={8}>
      <Form>
        <FormGroup label={t('Name')} isRequired>
          <NameField
            name="name"
            aria-label={t('Name')}
            isDisabled={isEdit}
            resourceType="fleets"
            helperText={<KubernetesLabelHelperText />}
            getExistsErrMsg={(name) => t(`A fleet named "{{name}}" already exists`, { name })}
          />
        </FormGroup>
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
