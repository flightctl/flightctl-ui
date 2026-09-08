import * as React from 'react';
import {
  Alert,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { useTranslation } from '../../../../hooks/useTranslation';
import { type FleetFormValues, UpdateMode } from '../../../../types/deviceSpec';
import LabelsView from '../../../common/LabelsView';
import { toAPILabel } from '../../../../utils/labels';
import RepositorySourceList from '../../../Repository/RepositoryDetails/RepositorySourceList';
import { getErrorMessage } from '../../../../utils/error';
import { getApiConfig } from '../../../Device/EditDeviceWizard/deviceSpecUtils';
import SystemImage from '../../../Device/EditDeviceWizard/SystemImageDescriptionGroup';
import ReviewApplications from '../../../Device/EditDeviceWizard/steps/ReviewApplications';
import ReviewTrackedSystemdServices from '../../../Device/EditDeviceWizard/steps/ReviewTrackedSystemdServices';
import {
  ReviewUpdateDisruptionBudget,
  ReviewUpdateRolloutPolicy,
} from '../../../Device/EditDeviceWizard/steps/ReviewUpdatePolicy';

export const reviewStepId = 'review';

const ReviewStep = ({ error }: { error?: unknown }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<FleetFormValues>();

  return (
    <Stack hasGutter>
      <StackItem isFilled>
        <DescriptionList
          isHorizontal
          horizontalTermWidthModifier={{
            default: '25ch',
          }}
        >
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Fleet name')}</DescriptionListTerm>
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

          <SystemImage osSpec={values.osSpec} isFleet={true} />
          {values.configTemplates.length > 0 && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Configurations')}</DescriptionListTerm>
              <DescriptionListDescription>
                <RepositorySourceList configs={values.configTemplates.map(getApiConfig)} />
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
          {values.updateMode === UpdateMode.Customized && (
            <>
              {values.rolloutPolicy.isCustomized && (
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Rollout policy')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <ReviewUpdateRolloutPolicy rolloutPolicy={values.rolloutPolicy} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              {values.disruptionBudget.isCustomized && (
                <DescriptionListGroup>
                  <DescriptionListTerm>{t('Disruption budget')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <ReviewUpdateDisruptionBudget disruptionBudget={values.disruptionBudget} />
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
            </>
          )}
        </DescriptionList>
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
