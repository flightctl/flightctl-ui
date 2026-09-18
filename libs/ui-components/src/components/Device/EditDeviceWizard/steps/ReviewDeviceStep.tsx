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
import type { EditDeviceFormValues } from '../../../../types/deviceSpec';
import {
  ApplicationWorkloadsReviewCard,
  ConfigurationsReviewCard,
  DeviceSpecUpdatesReviewCard,
  ReviewCard,
  ReviewLabelSection,
  SystemImageReviewCard,
  SystemdUnitsReviewCard,
} from '../ReviewStepSections';
import { getErrorMessage } from '../../../../utils/error';

export const reviewDeviceStepId = 'review-device';

type ReviewDeviceStepProps = {
  showUpdateStatus?: boolean;
  error?: unknown;
};

const ReviewDeviceStep = ({ showUpdateStatus, error }: ReviewDeviceStepProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<EditDeviceFormValues>();

  return (
    <Stack hasGutter>
      <ReviewCard title={t('General information')}>
        <DescriptionList isHorizontal isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Device alias')}</DescriptionListTerm>
            <DescriptionListDescription>{values.deviceAlias || t('Untitled')}</DescriptionListDescription>
          </DescriptionListGroup>

          <ReviewLabelSection title={t('Device labels')} labels={values.labels} />

          {values.fleetMatch && (
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Device fleet')}</DescriptionListTerm>
              <DescriptionListDescription>{values.fleetMatch}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </DescriptionList>
      </ReviewCard>

      <SystemImageReviewCard values={values} showUpdateStatus={showUpdateStatus} />

      <ConfigurationsReviewCard values={values} />

      <ApplicationWorkloadsReviewCard apps={values.applications} showUpdateStatus={showUpdateStatus} />

      <DeviceSpecUpdatesReviewCard values={values} />

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

export default ReviewDeviceStep;
