import * as React from 'react';
import { Alert, Checkbox, FormGroup, FormSection, Grid } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';

import { BatchLimitType, FleetFormValues } from '../types';
import { useTranslation } from '../../../../hooks/useTranslation';
import WithHelperText from '../../../common/WithHelperText';

import FlightCtlForm from '../../../form/FlightCtlForm';
import UpdateStepRolloutPolicy from './UpdateStepRolloutPolicy';
import UpdateStepDisruptionBudget from './UpdateStepDisruptionBudget';
import UpdateConfirmChangesModal, { StepSetting } from './UpdateConfirmChangesModal';

export const updatePolicyStepId = 'update-policy';

export const isUpdatePolicyStepValid = (errors: FormikErrors<FleetFormValues>) =>
  !errors.rolloutPolicy && !errors.disruptionBudget;

const UpdatePolicyStep = () => {
  const { t } = useTranslation();

  const {
    values: { rolloutPolicy, disruptionBudget },
    setFieldValue,
  } = useFormikContext<FleetFormValues>();

  const [hasAdvancedMode, setHasAdvancedMode] = React.useState<boolean>(
    rolloutPolicy.isAdvanced || disruptionBudget.isAdvanced,
  );
  const [hasAdvancedRollout, setHasAdvancedRollout] = React.useState<boolean>(rolloutPolicy.isAdvanced);
  const [hasAdvancedDisruption, setHasAdvancedDisruption] = React.useState<boolean>(disruptionBudget.isAdvanced);
  const [alertSwitchToBasic, setAlertSwitchToBasic] = React.useState<StepSetting>();

  const onSettingsChange = (setting: StepSetting, toAdvanced: boolean) => {
    if (toAdvanced) {
      switch (setting) {
        case 'all-settings':
          setHasAdvancedMode(true);
          break;
        case 'rollout-policies':
          setFieldValue('rolloutPolicy.isAdvanced', true);
          setHasAdvancedRollout(true);
          onChangePolicyType(true);
          break;
        case 'disruption-budget':
          setFieldValue('disruptionBudget.isAdvanced', true);
          setHasAdvancedDisruption(true);
          onChangeDisruptionBudget(true);
          break;
      }
    } else {
      setAlertSwitchToBasic(setting);
    }
  };

  const onChangePolicyType = (toAdvanced: boolean) => {
    setFieldValue(
      'rolloutPolicy.batches',
      toAdvanced
        ? [
            {
              limit: '',
              limitType: BatchLimitType.BatchLimitPercent,
              successThreshold: '',
              selector: [],
            },
          ]
        : [],
    );
  };

  const onChangeDisruptionBudget = (toAdvanced: boolean) => {
    if (!toAdvanced) {
      setFieldValue('disruptionBudget', {
        groupBy: [],
        minAvailable: '',
        maxUnavailable: '',
      });
    }
  };

  const onModalClose = (doSwitch: boolean) => {
    setAlertSwitchToBasic(undefined);
    if (!doSwitch) {
      return;
    }

    // When the user confirms switching a setting to its basic mode
    switch (alertSwitchToBasic) {
      case 'all-settings':
        setHasAdvancedMode(false);
        setHasAdvancedRollout(false);
        setHasAdvancedDisruption(false);
        setFieldValue('rolloutPolicy.isAdvanced', false);
        setFieldValue('disruptionBudget.isAdvanced', false);
        break;
      case 'rollout-policies':
        setFieldValue('rolloutPolicy.isAdvanced', false);
        setHasAdvancedRollout(false);
        onChangePolicyType(false);
        if (!disruptionBudget.isAdvanced) {
          setHasAdvancedMode(false);
        }
        break;
      case 'disruption-budget':
        setFieldValue('disruptionBudget.isAdvanced', false);
        setHasAdvancedDisruption(false);
        onChangeDisruptionBudget(false);
        if (doSwitch && !rolloutPolicy.isAdvanced) {
          setHasAdvancedMode(false);
        }
        break;
    }
  };

  return (
    <Grid span={8}>
      <FlightCtlForm>
        <FormGroup>
          <Checkbox
            label={t('Use basic configurations')}
            isChecked={!hasAdvancedMode}
            id="all-settings"
            onChange={(_ev: React.FormEvent<HTMLInputElement>, toBasic: boolean) => {
              onSettingsChange('all-settings', !toBasic);
            }}
          />
        </FormGroup>
        {hasAdvancedMode ? (
          <FormSection title={t('Advanced configurations')} titleElement="h1" className="pf-v5-u-mt-sm">
            {/* Rollout policies */}
            <Checkbox
              label={
                <WithHelperText
                  showLabel
                  ariaLabel={t('Set rollout policies')}
                  content={t('Rollout policies allow you to control the order of updates for the fleet devices.')}
                />
              }
              isChecked={hasAdvancedRollout}
              id="rolloutPolicy"
              onChange={(_ev: React.FormEvent<HTMLInputElement>, toAdvanced: boolean) =>
                onSettingsChange('rollout-policies', toAdvanced)
              }
            />
            {rolloutPolicy.isAdvanced && <UpdateStepRolloutPolicy />}

            {/* Disruption budget */}
            <Checkbox
              label={
                <WithHelperText
                  showLabel
                  ariaLabel={t('Set disruption budget')}
                  content={t(
                    'Disruption budget allows you to limit the number of similar devices that may be updating simultaneously.',
                  )}
                />
              }
              isChecked={hasAdvancedDisruption}
              id="disruptionBudget"
              onChange={(_ev: React.FormEvent<HTMLInputElement>, toAdvanced: boolean) =>
                onSettingsChange('disruption-budget', toAdvanced)
              }
            />
            {disruptionBudget.isAdvanced && <UpdateStepDisruptionBudget />}
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
