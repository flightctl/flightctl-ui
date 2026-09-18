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
import type { FleetFormValues } from '../../../../types/deviceSpec';
import { getErrorMessage } from '../../../../utils/error';
import {
  ApplicationWorkloadsReviewCard,
  ConfigurationsReviewCard,
  DeviceSpecUpdatesReviewCard,
  ReviewCard,
  ReviewLabelSection,
  SystemImageReviewCard,
  SystemdUnitsReviewCard,
} from '../../../Device/EditDeviceWizard/ReviewStepSections';
import {
  ReviewDeltaGeneration,
  ReviewDisruptionBudget,
  ReviewRolloutPolicy,
} from '../../../Device/EditDeviceWizard/steps/ReviewUpdatePolicy';

export const reviewStepId = 'review';

const FleetUpdatePolicyContent = ({ values }: { values: FleetFormValues }) => {
  const { t } = useTranslation();
  return (
    <>
      {values.rolloutPolicy?.isCustomized && (
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Rollout policy')}</DescriptionListTerm>
          <DescriptionListDescription>
            <ReviewRolloutPolicy rolloutPolicy={values.rolloutPolicy} />
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      {values.disruptionBudget?.isCustomized && (
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Disruption budget')}</DescriptionListTerm>
          <DescriptionListDescription>
            <ReviewDisruptionBudget disruptionBudget={values.disruptionBudget} />
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      <ReviewDeltaGeneration deltaGeneration={values.deltaGeneration} />
    </>
  );
};

const ReviewStep = ({ showUpdateStatus, error }: { showUpdateStatus?: boolean; error?: unknown }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<FleetFormValues>();

  return (
    <Stack hasGutter>
      <ReviewCard title={t('General information')}>
        <DescriptionList isHorizontal isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Fleet name')}</DescriptionListTerm>
            <DescriptionListDescription>{values.name}</DescriptionListDescription>
          </DescriptionListGroup>

          <ReviewLabelSection title={t('Fleet labels')} labels={values.fleetLabels} />
          <ReviewLabelSection title={t('Device selector')} labels={values.labels} />
        </DescriptionList>
      </ReviewCard>

      <SystemImageReviewCard values={values} showUpdateStatus={showUpdateStatus} />

      <ConfigurationsReviewCard values={values} />

      <ApplicationWorkloadsReviewCard apps={values.applications} showUpdateStatus={showUpdateStatus} />

      <DeviceSpecUpdatesReviewCard values={values}>
        <FleetUpdatePolicyContent values={values} />
      </DeviceSpecUpdatesReviewCard>

      <SystemdUnitsReviewCard values={values} />

      {error ? (
        <StackItem>
          <Alert isInline variant="danger" title={t('An error occurred')}>
            {getErrorMessage(error)}
          </Alert>
        </StackItem>
      ) : null}
    </Stack>
  );
};

export default ReviewStep;
