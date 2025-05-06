import * as React from 'react';
import { FormGroup, Grid } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import useDeviceLabelMatch from '../../../../hooks/useDeviceLabelMatch';
import FlightCtlForm from '../../../form/FlightCtlForm';
import LabelsField from '../../../form/LabelsField';
import RichValidationTextField from '../../../form/RichValidationTextField';
import { getLabelValueValidations } from '../../../form/validations';
import DeviceLabelMatch from '../../../modals/ApproveDeviceModal/DeviceLabelMatch';
import { EditDeviceFormValues } from '../../../../types/deviceSpec';

export const generalInfoStepId = 'general-info';

export const isGeneralInfoStepValid = (errors: FormikErrors<EditDeviceFormValues>) => {
  return !errors.deviceAlias && !errors.labels;
};

const GeneralInfoStep = () => {
  const { t } = useTranslation();
  const [matchLabelsOnChange, matchStatus] = useDeviceLabelMatch();

  const { values, setFieldValue } = useFormikContext<EditDeviceFormValues>();

  React.useEffect(() => {
    if (matchStatus.status === 'checked--unique') {
      setFieldValue('fleetMatch', matchStatus.detail); // set the name of the matched fleet
    } else {
      setFieldValue('fleetMatch', '');
    }
  }, [matchStatus, setFieldValue]);

  // When users go back to the General info step, we trigger the fleet match check
  React.useEffect(() => {
    if (values.labels) {
      matchLabelsOnChange(values.labels, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchLabelsOnChange]);

  return (
    <Grid lg={5} span={8}>
      <FlightCtlForm>
        <RichValidationTextField
          fieldName="deviceAlias"
          aria-label={t('Device alias')}
          validations={getLabelValueValidations(t)}
        />
        <FormGroup label={t('Device labels')}>
          <LabelsField name="labels" onChangeCallback={matchLabelsOnChange} />
        </FormGroup>
        <FormGroup label={t('Fleet name')}>
          <DeviceLabelMatch matchStatus={matchStatus} />
        </FormGroup>
      </FlightCtlForm>
    </Grid>
  );
};

export default GeneralInfoStep;
