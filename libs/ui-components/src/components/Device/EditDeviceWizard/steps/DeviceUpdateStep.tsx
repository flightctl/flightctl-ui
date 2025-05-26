import * as React from 'react';
import { Alert, Grid, Title } from '@patternfly/react-core';
import { FormikErrors, useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import UpdateStepUpdatePolicy from '../../../Fleet/CreateFleet/steps/UpdateStepUpdatePolicy';

import FlightCtlForm from '../../../form/FlightCtlForm';
import { DeviceSpecConfigFormValues } from '../../../../types/deviceSpec';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import CheckboxField from '../../../form/CheckboxField';

export const deviceUpdatePolicyStepId = 'update-policy';

export const isUpdatePolicyStepValid = (errors: FormikErrors<DeviceSpecConfigFormValues>) => !errors.updatePolicy;

const UpdatePolicyStep = ({ isReadOnly }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();

  const {
    values: { useBasicUpdateConfig },
  } = useFormikContext<DeviceSpecConfigFormValues>();

  return (
    <Grid lg={8}>
      <FlightCtlForm>
        <CheckboxField name="useBasicUpdateConfig" label={t('Use basic configurations')} isDisabled={isReadOnly} />
        {!useBasicUpdateConfig ? (
          <>
            <Title headingLevel="h3">{t('Advanced configurations')}</Title>
            <FormGroupWithHelperText
              label={t('Update policies')}
              content={t('Update policies allow you to control when updates should be downloaded and applied.')}
            >
              <UpdateStepUpdatePolicy isReadOnly={isReadOnly} />
            </FormGroupWithHelperText>
          </>
        ) : (
          <Alert isInline variant="info" title={t('Default update policy')}>
            {t('The device will download and apply updates as soon as they are available.')}
          </Alert>
        )}
      </FlightCtlForm>
    </Grid>
  );
};

export default UpdatePolicyStep;
