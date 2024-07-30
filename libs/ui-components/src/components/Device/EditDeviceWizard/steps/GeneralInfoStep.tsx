import * as React from 'react';
import { Form, FormGroup, Grid } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import useDeviceLabelMatch from '../../../../hooks/useDeviceLabelMatch';
import LabelsField from '../../../form/LabelsField';
import RichValidationTextField from '../../../form/RichValidationTextField';
import { getLabelValueValidations } from '../../../form/validations';
import DeviceLabelMatch from '../../../modals/ApproveDeviceModal/DeviceLabelMatch';
import { EditDeviceFormValues } from '../types';

export const generalInfoStepId = 'general-info';

export const isGeneralInfoStepValid = (errors: FormikErrors<EditDeviceFormValues>) => {
  return !errors.deviceAlias && !errors.labels;
};

const GeneralInfoStep = () => {
  const { t } = useTranslation();
  const [matchLabelsOnChange, matchStatus] = useDeviceLabelMatch();

  const { setFieldValue } = useFormikContext<EditDeviceFormValues>();

  React.useEffect(() => {
    if (matchStatus.status === 'checked--unique') {
      setFieldValue('fleetMatch', matchStatus.detail); // set the name of the matched fleet
    } else {
      setFieldValue('fleetMatch', '');
    }
  }, [matchStatus, setFieldValue]);

  return (
    <Grid lg={5} span={8}>
      <Form>
        <RichValidationTextField
          fieldName="deviceAlias"
          aria-label={t('Alias')}
          validations={getLabelValueValidations(t)}
        />
        <FormGroup label={t('Device labels')}>
          <LabelsField name="labels" onChangeCallback={matchLabelsOnChange} />
        </FormGroup>
        <FormGroup label={t('Fleet name')}>
          <DeviceLabelMatch matchStatus={matchStatus} />
        </FormGroup>
      </Form>
    </Grid>
  );
};

export default GeneralInfoStep;
