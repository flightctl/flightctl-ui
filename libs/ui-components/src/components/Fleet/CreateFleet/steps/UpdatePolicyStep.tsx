import * as React from 'react';
import { Alert, Checkbox, FormGroup, FormSection, Grid } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';

import {
  DEFAULT_BACKEND_UPDATE_TIMEOUT_MINUTES,
  getEmptyInitializedBatch,
  getEmptyUpdateFormParams,
} from '../fleetSpecUtils';
import { useTranslation } from '../../../../hooks/useTranslation';
import LabelWithHelperText from '../../../common/WithHelperText';
import { FleetFormValues } from '../../../../types/deviceSpec';

import FlightCtlForm from '../../../form/FlightCtlForm';
import UpdateStepRolloutPolicy from './UpdateStepRolloutPolicy';
import UpdateStepDisruptionBudget from './UpdateStepDisruptionBudget';
import UpdateStepUpdatePolicy from './UpdateStepUpdatePolicy';
import UpdateConfirmChangesModal, { StepSetting } from './UpdateConfirmChangesModal';

export const updatePolicyStepId = 'update-policy';

export const isUpdatePolicyStepValid = (errors: FormikErrors<FleetFormValues>) =>
  !errors.rolloutPolicy && !errors.disruptionBudget && !errors.updatePolicy;

const UpdatePolicyStep = ({ isReadOnly }: { isReadOnly: boolean }) => {
  const { t } = useTranslation();

  const {
    values: { rolloutPolicy, disruptionBudget, updatePolicy },
    setFieldValue,
  } = useFormikContext<FleetFormValues>();

  const [forceShowAdvancedMode, setForceShowAdvancedMode] = React.useState<boolean>(false);
  const [alertSwitchToBasic, setAlertSwitchToBasic] = React.useState<StepSetting>();
  const hasAdvancedMode = rolloutPolicy.isAdvanced || disruptionBudget.isAdvanced || updatePolicy.isAdvanced;

  const onSettingsChange = (setting: StepSetting, toAdvanced: boolean) => {
    if (toAdvanced) {
      switch (setting) {
        case 'all-settings':
          setForceShowAdvancedMode(true);
          break;
        case 'rollout-policies':
          setFieldValue('rolloutPolicy.isAdvanced', true);
          void onChangePolicyType(true);
          break;
        case 'disruption-budget':
          setFieldValue('disruptionBudget.isAdvanced', true);
          void onChangeDisruptionBudget(true);
          break;
        case 'update-policies':
          setFieldValue('updatePolicy.isAdvanced', true);
          void onChangeUpdatePolicy(true);
          break;
      }
    } else {
      setAlertSwitchToBasic(setting);
    }
  };

  const onChangePolicyType = async (toAdvanced: boolean) => {
    await setFieldValue('rolloutPolicy', {
      isAdvanced: toAdvanced,
      batches: toAdvanced ? [getEmptyInitializedBatch()] : [],
      updateTimeout: DEFAULT_BACKEND_UPDATE_TIMEOUT_MINUTES,
    });
  };

  const onChangeDisruptionBudget = async (toAdvanced: boolean) => {
    if (!toAdvanced) {
      await setFieldValue('disruptionBudget', {
        isAdvanced: false,
        groupBy: [],
        minAvailable: '',
        maxUnavailable: '',
      });
    }
  };

  const onChangeUpdatePolicy = async (toAdvanced: boolean) => {
    if (!toAdvanced) {
      await setFieldValue('updatePolicy', getEmptyUpdateFormParams());
    }
  };

  const onModalClose = async (doSwitch: boolean) => {
    setAlertSwitchToBasic(undefined);
    if (!doSwitch) {
      return;
    }

    // When the user confirms switching a setting to its basic mode
    switch (alertSwitchToBasic) {
      case 'all-settings':
        await onChangePolicyType(false);
        await onChangeDisruptionBudget(false);
        await onChangeUpdatePolicy(false);
        break;
      case 'rollout-policies':
        void onChangePolicyType(false);
        break;
      case 'disruption-budget':
        void onChangeDisruptionBudget(false);
        break;
      case 'update-policies':
        void onChangeUpdatePolicy(false);
        break;
    }
    setForceShowAdvancedMode(false);
  };

  return (
    <Grid lg={8}>
      <FlightCtlForm>
        <FormGroup>
          <Checkbox
            label={t('Use basic configurations')}
            isChecked={!hasAdvancedMode && !forceShowAdvancedMode}
            id="all-settings"
            onChange={(_ev: React.FormEvent<HTMLInputElement>, toBasic: boolean) => {
              onSettingsChange('all-settings', !toBasic);
            }}
            isDisabled={isReadOnly}
          />
        </FormGroup>
        {hasAdvancedMode || forceShowAdvancedMode ? (
          <FormSection title={t('Advanced configurations')} titleElement="h1" className="pf-v5-u-mt-sm">
            {/* Rollout policies */}
            <Checkbox
              label={
                <LabelWithHelperText
                  label={t('Set rollout policies')}
                  content={t('Rollout policies allow you to control the order of updates for the fleet devices.')}
                />
              }
              isChecked={rolloutPolicy.isAdvanced}
              id="advRolloutPolicy"
              onChange={(_ev: React.FormEvent<HTMLInputElement>, toAdvanced: boolean) =>
                onSettingsChange('rollout-policies', toAdvanced)
              }
              body={rolloutPolicy.isAdvanced && <UpdateStepRolloutPolicy isReadOnly={isReadOnly} />}
              isDisabled={isReadOnly}
            />

            {/* Disruption budget */}
            <Checkbox
              label={
                <LabelWithHelperText
                  label={t('Set disruption budget')}
                  content={t(
                    'Disruption budget allows you to limit the number of similar devices that may be updating simultaneously.',
                  )}
                />
              }
              isChecked={disruptionBudget.isAdvanced}
              id="advDisruptionBudget"
              onChange={(_ev: React.FormEvent<HTMLInputElement>, toAdvanced: boolean) =>
                onSettingsChange('disruption-budget', toAdvanced)
              }
              body={disruptionBudget.isAdvanced && <UpdateStepDisruptionBudget isReadOnly={isReadOnly} />}
              isDisabled={isReadOnly}
            />

            {/* Update (and download) policies */}
            <Checkbox
              label={
                <LabelWithHelperText
                  label={t('Set update policies')}
                  content={t('Update policies allow you to control when updates should be downloaded and applied.')}
                />
              }
              isChecked={updatePolicy.isAdvanced}
              id="advUpdatePolicy"
              onChange={(_ev: React.FormEvent<HTMLInputElement>, toAdvanced: boolean) =>
                onSettingsChange('update-policies', toAdvanced)
              }
              body={updatePolicy.isAdvanced && <UpdateStepUpdatePolicy isReadOnly={isReadOnly} />}
              isDisabled={isReadOnly}
            />
          </FormSection>
        ) : (
          <Alert isInline variant="info" title={t('Default update policy')}>
            {t('All the devices that are part of this fleet will receive updates as soon as they are available.')}
          </Alert>
        )}
        {alertSwitchToBasic && <UpdateConfirmChangesModal setting={alertSwitchToBasic} onClose={onModalClose} />}
      </FlightCtlForm>
    </Grid>
  );
};

export default UpdatePolicyStep;
