import * as React from 'react';
import { FormGroup, List, ListItem, Stack, StackItem, Title } from '@patternfly/react-core';
import { type FormikErrors, useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import { type FleetFormValues, UpdateMode } from '../../../../types/deviceSpec';

import FlightCtlForm from '../../../form/FlightCtlForm';
import CheckboxField from '../../../form/CheckboxField';
import { DefaultHelperText } from '../../../form/FieldHelperText';
import RadioField from '../../../form/RadioField';
import UpdateStepRolloutPolicy from './UpdateStepRolloutPolicy';
import UpdateStepDisruptionBudget from './UpdateStepDisruptionBudget';
import UpdateStepUpdatePolicy from './UpdateStepUpdatePolicy';

import './UpdatePolicyStep.css';

export const updatePolicyStepId = 'update-policy';

export const isUpdatePolicyStepValid = (errors: FormikErrors<FleetFormValues>) =>
  !errors.rolloutPolicy && !errors.disruptionBudget && !errors.updatePolicy;

export const CustomizedUpdatesSectionBody = ({
  updateMode,
  isFleet,
  children,
}: React.PropsWithChildren<{ updateMode: UpdateMode; isFleet: boolean }>) => {
  const { t } = useTranslation();
  if (updateMode === UpdateMode.Default) {
    return null;
  }

  return (
    <div
      className="fctl-update-policy--customize-options"
      role="group"
      aria-label={isFleet ? t('Customize updates') : t('Maintenance windows')}
    >
      {children}
    </div>
  );
};

const CustomizedUpdatesSection = ({ isReadOnly }: { isReadOnly: boolean }) => {
  const { t } = useTranslation();

  const {
    values: { rolloutPolicy, disruptionBudget, updatePolicy },
  } = useFormikContext<FleetFormValues>();

  return (
    <List isPlain style={{ gap: 'var(--pf-t--global--spacer--gap--group-to-group--vertical--default, 1rem)' }}>
      <ListItem>
        <CheckboxField
          name="rolloutPolicy.isCustomized"
          label={t('Set rollout order')}
          description={t('Rollout order controls in what sequence fleet devices are updated.')}
          isDisabled={isReadOnly}
          body={rolloutPolicy.isCustomized && <UpdateStepRolloutPolicy isReadOnly={isReadOnly} />}
        />
      </ListItem>
      <ListItem>
        <CheckboxField
          name="disruptionBudget.isCustomized"
          label={t('Set disruption budget')}
          description={t(
            'Disruption budget allows you to limit the number of similar devices that may be updating simultaneously.',
          )}
          isDisabled={isReadOnly}
          body={disruptionBudget.isCustomized && <UpdateStepDisruptionBudget isReadOnly={isReadOnly} />}
        />
      </ListItem>
      <ListItem>
        <CheckboxField
          name="updatePolicy.isCustomized"
          label={t('Set maintenance windows')}
          description={t('Maintenance windows control when devices may download and install updates.')}
          isDisabled={isReadOnly}
          body={updatePolicy.isCustomized && <UpdateStepUpdatePolicy isReadOnly={isReadOnly} />}
        />
      </ListItem>
    </List>
  );
};

const UpdatePolicyStep = ({ isReadOnly }: { isReadOnly: boolean }) => {
  const { t } = useTranslation();

  const {
    values: { updateMode },
  } = useFormikContext<FleetFormValues>();

  return (
    <FlightCtlForm>
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h2" size="xl" className="pf-v6-u-mb-sm">
            {t('Updates')}
          </Title>
          <DefaultHelperText helperText={t('Choose how updates are delivered to devices in this fleet.')} />
        </StackItem>
        <StackItem>
          <FormGroup label={t('Update behavior')} role="radiogroup" isStack>
            <RadioField
              id="fleet-update-defaults"
              name="updateMode"
              label={t('Immediate updates')}
              description={t('Devices receive updates as soon as they are available.')}
              checkedValue={UpdateMode.Default}
              isDisabled={isReadOnly}
            />
            <RadioField
              id="fleet-update-customized"
              name="updateMode"
              label={t('Customize maintenance window and scheduling')}
              description={t('Set rollout order, disruption budget, or maintenance windows.')}
              checkedValue={UpdateMode.Customized}
              isDisabled={isReadOnly}
              body={
                <CustomizedUpdatesSectionBody updateMode={updateMode} isFleet>
                  <CustomizedUpdatesSection isReadOnly={isReadOnly} />
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
