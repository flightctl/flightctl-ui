import * as React from 'react';

import { Flex, FlexItem, Spinner } from '@patternfly/react-core';
import { ApplicationDesiredState, ApplicationStatusType } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { getApplicationStatusItems } from '../../utils/status/applications';
import { hasAplicationStatusMismatch, transitionalStatuses } from '../../utils/applicationLifecycle';
import StatusDisplay, { StatusDisplayContent } from './StatusDisplay';

const isTransitionalStatus = (status?: ApplicationStatusType) => status && transitionalStatuses.includes(status);

/**
 * Refers to the summary status of all applications in one device
 *
 * @param status the summary application status
 * @constructor
 */
const ApplicationStatus = ({
  status,
  desiredState,
}: {
  status?: ApplicationStatusType;
  desiredState?: ApplicationDesiredState;
}) => {
  const { t } = useTranslation();

  const isReconciling = status && hasAplicationStatusMismatch(status, desiredState);
  const statusItem = getApplicationStatusItems(t).find((statusItem) => statusItem.id === status);
  const statusLabel = statusItem?.label || status || ApplicationStatusType.ApplicationStatusUnknown;

  if (isReconciling) {
    return (
      <StatusDisplayContent
        label={t('Reconciling')}
        messageTitle={t('Application status mismatch')}
        level="warning"
        message={t(
          'Desired state: {{ desiredState }}. Reported status: {{ appStatus }}. The agent has not yet picked up the change.',
          {
            desiredState:
              desiredState === ApplicationDesiredState.ApplicationDesiredStateStopped ? t('Stopped') : t('Running'),
            appStatus: statusLabel,
          },
        )}
      />
    );
  }

  // The transitional statuses use a Spinner which cannot be used with StatusDisplay
  if (isTransitionalStatus(status)) {
    return (
      <Flex className="ftcl_status-label">
        <FlexItem>
          <Spinner size="sm" aria-label={statusLabel} />
        </FlexItem>
        <FlexItem>{statusLabel}</FlexItem>
      </Flex>
    );
  }

  return <StatusDisplay item={statusItem} />;
};

export default ApplicationStatus;
