import * as React from 'react';
import {
  Alert,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import { FleetFormValues } from '../types';
import LabelsView from '../../../common/LabelsView';
import FlightControlDescriptionList from '../../../common/FlightCtlDescriptionList';
import { toAPILabel } from '../../../../utils/labels';
import RepositorySourceList from '../../../Repository/RepositoryDetails/RepositorySourceList';
import { getErrorMessage } from '../../../../utils/error';
import { getAPIConfig } from '../../../Device/EditDeviceWizard/deviceSpecUtils';
import ReviewApplications from '../../../Device/EditDeviceWizard/steps/ReviewApplications';
import ReviewTrackedSystemdServices from '../../../Device/EditDeviceWizard/steps/ReviewTrackedSystemdServices';
import ReviewUpdatePolicy from '../../../Device/EditDeviceWizard/steps/ReviewUpdatePolicy';

export const reviewStepId = 'review';

const ReviewStep = ({ error }: { error?: unknown }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<FleetFormValues>();

  return (
    <Stack hasGutter>
      <StackItem isFilled>
        <FlightControlDescriptionList
          isHorizontal
          horizontalTermWidthModifier={{
            default: '25ch',
          }}
        >
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Name')}</DescriptionListTerm>
            <DescriptionListDescription>{values.name}</DescriptionListDescription>
          </DescriptionListGroup>
          {values.fleetLabels.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Fleet labels')}</DescriptionListTerm>
              <DescriptionListDescription>
                <LabelsView prefix="fleet" labels={toAPILabel(values.fleetLabels)} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}

          {values.labels.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Device selector')}</DescriptionListTerm>
              <DescriptionListDescription>
                <LabelsView prefix="device" labels={toAPILabel(values.labels)} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}

          <DescriptionListGroup>
            <DescriptionListTerm>{t('System image')}</DescriptionListTerm>
            <DescriptionListDescription>
              {values.osImage || t(`The fleet will not manage system image`)}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {values.configTemplates.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Configurations')}</DescriptionListTerm>
              <DescriptionListDescription>
                <RepositorySourceList configs={values.configTemplates.map(getAPIConfig)} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {values.applications.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Applications')}</DescriptionListTerm>
              <DescriptionListDescription>
                <ReviewApplications apps={values.applications} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}

          {values.systemdUnits.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Tracked systemd services')}</DescriptionListTerm>
              <DescriptionListDescription>
                <ReviewTrackedSystemdServices systemdUnits={values.systemdUnits} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}

          {values.rolloutPolicy.isActive && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Rollout policy')}</DescriptionListTerm>
              <DescriptionListDescription>
                <ReviewUpdatePolicy rolloutPolicy={values.rolloutPolicy} />
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </FlightControlDescriptionList>
      </StackItem>
      {!!error && (
        <StackItem>
          <Alert isInline variant="danger" title={t('An error occurred')}>
            {getErrorMessage(error)}
          </Alert>
        </StackItem>
      )}
    </Stack>
  );
};

export default ReviewStep;
