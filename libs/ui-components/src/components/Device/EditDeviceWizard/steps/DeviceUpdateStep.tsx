import * as React from 'react';
import { Alert, Checkbox, FormGroup, Grid } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import UpdateConfirmChangesModal from '../../../Fleet/CreateFleet/steps/UpdateConfirmChangesModal';
import UpdateStepUpdatePolicy from '../../../Fleet/CreateFleet/steps/UpdateStepUpdatePolicy';

import FlightCtlForm from '../../../form/FlightCtlForm';
import { DeviceSpecConfigFormValues } from '../types';

export const deviceUpdatePolicyStepId = 'update-policy';

export const isUpdatePolicyStepValid = (errors: FormikErrors<DeviceSpecConfigFormValues>) => !errors.updatePolicy;

// TODO what can be shared with the fleet step???
const UpdatePolicyStep = () => {
  const { t } = useTranslation();

  const {
    values: { updatePolicy },
    setFieldValue,
  } = useFormikContext<DeviceSpecConfigFormValues>();

  const [alertSwitchToBasic, setAlertSwitchToBasic] = React.useState<boolean>();
  const hasAdvancedMode = updatePolicy.isAdvanced;

  const onAdvancedEnableChange = (toAdvanced: boolean) => {
    if (toAdvanced) {
      setFieldValue('updatePolicy.isAdvanced', true);
      void onChangeUpdatePolicy(true);
    } else {
      setAlertSwitchToBasic(true);
    }
  };

  const onChangeUpdatePolicy = async (toAdvanced: boolean) => {
    if (!toAdvanced) {
      await setFieldValue('updatePolicy', {
        isAdvanced: false,
        downloadAndUpdateDiffer: false,
        downloadScheduleAt: '',
        downloadGraceTime: '',
        updateScheduleAt: '',
        updateGraceTime: '',
      });
    }
  };

  const onModalClose = (doSwitch: boolean) => {
    setAlertSwitchToBasic(false);
    if (doSwitch) {
      void onChangeUpdatePolicy(false);
    }
  };

  return (
    <Grid lg={8}>
      <FlightCtlForm>
        <FormGroup>
          <Checkbox
            label={t('Use basic update configurations')}
            isChecked={!hasAdvancedMode}
            id="basic-update-configuration"
            onChange={(_ev: React.FormEvent<HTMLInputElement>, toBasic: boolean) => {
              onAdvancedEnableChange(!toBasic);
            }}
          />
        </FormGroup>
        {hasAdvancedMode ? (
          <UpdateStepUpdatePolicy />
        ) : (
          <Alert isInline variant="info" title={t('Default update policy')}>
            {t('The device will download and apply updates as soon as they are available.')}
          </Alert>
        )}
        {alertSwitchToBasic && <UpdateConfirmChangesModal setting="update-policies" onClose={onModalClose} />}
      </FlightCtlForm>
    </Grid>
  );
};

export default UpdatePolicyStep;
