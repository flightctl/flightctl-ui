import * as React from 'react';
import { Alert, FormSection, Grid } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import LabelWithHelperText from '../../../common/WithHelperText';
import { FleetFormValues } from '../../../../types/deviceSpec';

import FlightCtlForm from '../../../form/FlightCtlForm';
import UpdateStepRolloutPolicy from './UpdateStepRolloutPolicy';
import UpdateStepDisruptionBudget from './UpdateStepDisruptionBudget';
import UpdateStepUpdatePolicy from './UpdateStepUpdatePolicy';
import CheckboxField from '../../../form/CheckboxField';

export const updatePolicyStepId = 'update-policy';

export const isUpdatePolicyStepValid = (errors: FormikErrors<FleetFormValues>) =>
  !errors.rolloutPolicy && !errors.disruptionBudget && !errors.updatePolicy;

const UpdatePolicyStep = ({ isReadOnly }: { isReadOnly: boolean }) => {
  const { t } = useTranslation();

  const {
    values: { useBasicUpdateConfig, rolloutPolicy, disruptionBudget, updatePolicy },
  } = useFormikContext<FleetFormValues>();

  return (
    <Grid lg={8}>
      <FlightCtlForm>
        <CheckboxField name="useBasicUpdateConfig" label={t('Use basic configurations')} isDisabled={isReadOnly} />
        {!useBasicUpdateConfig ? (
          <FormSection title={t('Advanced configurations')} titleElement="h1" className="pf-v5-u-mt-sm">
            {/* Rollout policies */}
            <CheckboxField
              name="rolloutPolicy.isAdvanced"
              label={
                <LabelWithHelperText
                  label={t('Set rollout policies')}
                  content={t('Rollout policies allow you to control the order of updates for the fleet devices.')}
                />
              }
              isDisabled={isReadOnly}
              body={rolloutPolicy.isAdvanced && <UpdateStepRolloutPolicy isReadOnly={isReadOnly} />}
            />

            {/* Disruption budget */}
            <CheckboxField
              name="disruptionBudget.isAdvanced"
              label={
                <LabelWithHelperText
                  label={t('Set disruption budget')}
                  content={t(
                    'Disruption budget allows you to limit the number of similar devices that may be updating simultaneously.',
                  )}
                />
              }
              isDisabled={isReadOnly}
              body={disruptionBudget.isAdvanced && <UpdateStepDisruptionBudget isReadOnly={isReadOnly} />}
            />

            {/* Update (and download) policies */}
            <CheckboxField
              name="updatePolicy.isAdvanced"
              label={
                <LabelWithHelperText
                  label={t('Set update policies')}
                  content={t('Update policies allow you to control when updates should be downloaded and applied.')}
                />
              }
              isDisabled={isReadOnly}
              body={updatePolicy.isAdvanced && <UpdateStepUpdatePolicy isReadOnly={isReadOnly} />}
            />
          </FormSection>
        ) : (
          <Alert isInline variant="info" title={t('Default update policy')}>
            {t('All the devices that are part of this fleet will receive updates as soon as they are available.')}
          </Alert>
        )}
      </FlightCtlForm>
    </Grid>
  );
};

export default UpdatePolicyStep;
