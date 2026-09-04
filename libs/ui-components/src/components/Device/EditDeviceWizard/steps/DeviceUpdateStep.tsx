import * as React from 'react';
import { FormGroup, Stack, StackItem, Title } from '@patternfly/react-core';
import { type FormikErrors, useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import UpdateStepUpdatePolicy from '../../../Fleet/CreateFleet/steps/UpdateStepUpdatePolicy';
import { CustomizedUpdatesSectionBody } from '../../../Fleet/CreateFleet/steps/UpdatePolicyStep';

import FlightCtlForm from '../../../form/FlightCtlForm';
import { type DeviceSpecConfigFormValues, UpdateMode } from '../../../../types/deviceSpec';
import RadioField from '../../../form/RadioField';
import { DefaultHelperText } from '../../../form/FieldHelperText';

export const deviceUpdatePolicyStepId = 'update-policy';

export const isUpdatePolicyStepValid = (errors: FormikErrors<DeviceSpecConfigFormValues>) => !errors.updatePolicy;

const UpdatePolicyStep = ({ isReadOnly }: { isReadOnly?: boolean }) => {
  const { t } = useTranslation();

  const {
    values: { updateMode },
  } = useFormikContext<DeviceSpecConfigFormValues>();

  return (
    <FlightCtlForm>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h2" size="xl">
            {t('Updates')}
          </Title>
          <DefaultHelperText helperText={t('Choose how updates are delivered to this device.')} />
        </StackItem>
        <StackItem>
          <FormGroup label={t('Update behavior')} role="radiogroup" isStack>
            <RadioField
              id="device-update-defaults"
              name="updateMode"
              label={t('Immediate updates')}
              description={t('Devices receive updates as soon as they are available.')}
              checkedValue={UpdateMode.Default}
              isDisabled={isReadOnly}
            />
            <RadioField
              id="device-update-customized"
              name="updateMode"
              label={t('Customize maintenance window and scheduling')}
              description={t('Set maintenance windows to control when updates are downloaded and applied.')}
              checkedValue={UpdateMode.Customized}
              isDisabled={isReadOnly}
              body={
                <CustomizedUpdatesSectionBody updateMode={updateMode} isFleet={false}>
                  <UpdateStepUpdatePolicy isReadOnly={isReadOnly} />
                </CustomizedUpdatesSectionBody>
              }
            />
          </FormGroup>
        </StackItem>
      </Stack>
    </FlightCtlForm>
  );
};

export default UpdatePolicyStep;
