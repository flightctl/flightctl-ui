import * as React from 'react';
import { Alert, Checkbox, FormGroup, Grid, Title } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import UpdateConfirmChangesModal from '../../../Fleet/CreateFleet/steps/UpdateConfirmChangesModal';
import UpdateStepUpdatePolicy from '../../../Fleet/CreateFleet/steps/UpdateStepUpdatePolicy';
import { getEmptyUpdateFormParams } from '../../../Fleet/CreateFleet/fleetSpecUtils';

import FlightCtlForm from '../../../form/FlightCtlForm';
import { DeviceSpecConfigFormValues } from '../../../../types/deviceSpec';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';

export const deviceUpdatePolicyStepId = 'update-policy';

export const isUpdatePolicyStepValid = (errors: FormikErrors<DeviceSpecConfigFormValues>) => !errors.updatePolicy;

const UpdatePolicyStep = () => {
  const { t } = useTranslation();

  const {
    values: { updatePolicy },
    setFieldValue,
    setFieldTouched,
  } = useFormikContext<DeviceSpecConfigFormValues>();

  const [alertSwitchToBasic, setAlertSwitchToBasic] = React.useState<boolean>();
  const hasAdvancedMode = updatePolicy.isAdvanced;

  const onChangeUpdatePolicy = async (toAdvanced: boolean) => {
    if (toAdvanced) {
      await setFieldTouched('updatePolicy', true);
    } else {
      await setFieldValue('updatePolicy', getEmptyUpdateFormParams(), true);
    }
  };

  const onAdvancedEnableChange = (toAdvanced: boolean) => {
    if (toAdvanced) {
      setFieldValue('updatePolicy.isAdvanced', true);
      onChangeUpdatePolicy(true);
    } else {
      setAlertSwitchToBasic(true);
    }
  };

  const onModalClose = (doSwitch: boolean) => {
    setAlertSwitchToBasic(false);
    if (doSwitch) {
      onChangeUpdatePolicy(false);
    }
  };

  return (
    <Grid lg={8}>
      <FlightCtlForm>
        <FormGroup>
          <Checkbox
            label={t('Use basic configurations')}
            isChecked={!hasAdvancedMode}
            id="basic-update-configuration"
            onChange={(_ev: React.FormEvent<HTMLInputElement>, toBasic: boolean) => {
              onAdvancedEnableChange(!toBasic);
            }}
          />
        </FormGroup>
        {hasAdvancedMode ? (
          <>
            <Title headingLevel="h3">{t('Advanced configurations')}</Title>
            <FormGroupWithHelperText
              label={t('Update policies')}
              content={t('Update policies allow you to control when updates should be downloaded and applied.')}
            >
              <UpdateStepUpdatePolicy />
            </FormGroupWithHelperText>
          </>
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
