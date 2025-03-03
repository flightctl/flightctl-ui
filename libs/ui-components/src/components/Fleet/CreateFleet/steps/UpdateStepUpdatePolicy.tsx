import * as React from 'react';
import { FormGroup, Stack, StackItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import CheckboxField from '../../../form/CheckboxField';
import TextField from '../../../form/TextField';

import { FleetFormValues } from '../types';

import WithHelperText from '../../../common/WithHelperText';
import { useTranslation } from '../../../../hooks/useTranslation';

import './UpdateStepUpdatePolicy.css';

const UpdateStepUpdatePolicy = () => {
  const { t } = useTranslation();

  const {
    values: { updatePolicy },
  } = useFormikContext<FleetFormValues>();

  // TODO timezone empty or "Local" for local timezone

  return (
    <Stack hasGutter className="fctl-update-policy__adv-section--nested">
      <StackItem>
        <CheckboxField
          label={t('Use different update schedules for downloading and installing updates')}
          name="updatePolicy.downloadAndUpdateDiffer"
        />
      </StackItem>

      <StackItem>
        <FormGroup
          isRequired
          label={
            <WithHelperText
              ariaLabel={
                updatePolicy.downloadAndUpdateDiffer
                  ? t('Downloading schedule')
                  : t('Downloading and installing schedule')
              }
              content={t('TBD.')}
              showLabel
            />
          }
        >
          <TextField aria-label={t('Schedule')} name="updatePolicy.downloadScheduleAt" />
          <TextField aria-label={t('Grace duration')} name="updatePolicy.downloadGraceTime" />
        </FormGroup>
      </StackItem>

      {updatePolicy.downloadAndUpdateDiffer && (
        <StackItem>
          <FormGroup
            isRequired
            label={<WithHelperText ariaLabel={t('Installing schedule')} content={t('TBD.')} showLabel />}
          >
            <TextField name="updatePolicy.updateScheduleAt" />
            <TextField name="updatePolicy.updateGraceTime" />
          </FormGroup>
        </StackItem>
      )}
    </Stack>
  );
};

export default UpdateStepUpdatePolicy;
