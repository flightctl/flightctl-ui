import * as React from 'react';
import { Alert, Stack, StackItem } from '@patternfly/react-core';
import { useField } from 'formik';

import useLabelKeyProvenance from '../../../../hooks/useLabelKeyProvenance';
import { useTranslation } from '../../../../hooks/useTranslation';
import { type FlightCtlLabel } from '../../../../types/extraTypes';
import { FormGroupWithHelperText } from '../../../common/WithHelperText';
import LabelsField from '../../../form/LabelsField';

type RolloutPolicyBatchSelectorFieldProps = {
  name: string;
  isDisabled?: boolean;
  'aria-label'?: string;
};

const RolloutPolicyBatchSelectorField = ({ name, isDisabled }: RolloutPolicyBatchSelectorFieldProps) => {
  const { t } = useTranslation();
  const [{ value: labels }] = useField<FlightCtlLabel[]>(name);
  const { isManagedLabel, managedKeys } = useLabelKeyProvenance(labels);

  return (
    <FormGroupWithHelperText
      label={t('Select devices')}
      content={t(
        'Match devices with operator labels (blue) or device-reported labels (gray). Device-reported values come from device status and can change over time.',
      )}
    >
      <Stack hasGutter>
        <StackItem>
          <LabelsField
            name={name}
            isDisabled={isDisabled}
            addButtonText={t('Add label or device-reported label')}
            isManagedLabel={isManagedLabel}
          />
        </StackItem>
        {managedKeys.length > 0 && (
          <StackItem>
            <Alert isInline variant="warning" title={t('Device-reported labels can change batch membership')}>
              {t(
                'You selected device-reported labels ({{keys}}). If devices later report different values, they may leave this batch. Rollouts that depend on these values can change when device status changes.',
                { keys: managedKeys.join(', ') },
              )}
            </Alert>
          </StackItem>
        )}
      </Stack>
    </FormGroupWithHelperText>
  );
};

export default RolloutPolicyBatchSelectorField;
