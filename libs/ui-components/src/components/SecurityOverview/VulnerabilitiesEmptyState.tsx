import * as React from 'react';

import { Alert, EmptyState, EmptyStateBody } from '@patternfly/react-core';

import { useTranslation } from '../../hooks/useTranslation';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';

export const VulnerabilitiesSingleEntityEmptyState = ({ entityType }: { entityType: 'device' | 'fleet' }) => {
  const { t } = useTranslation();

  let message = '';
  if (entityType === 'device') {
    message = t(
      'No vulnerabilities were found affecting the image currently deployed on this device. This reflects the most recent scan data available.',
    );
  } else {
    message = t(
      'No vulnerabilities were found affecting images currently deployed across all devices in this fleet. This reflects the most recent scan data available.',
    );
  }
  return (
    <EmptyState
      headingLevel="h1"
      status="success"
      icon={CheckCircleIcon}
      titleText={t('No vulnerabilities detected')}
      variant="full"
    >
      <EmptyStateBody>{message}</EmptyStateBody>
    </EmptyState>
  );
};

export const VulnerabilitiesOverviewEmptyState = ({ hasDevices }: { hasDevices: boolean }) => {
  const { t } = useTranslation();

  if (hasDevices) {
    return (
      <Alert variant="success" title={t('No CVEs detected')}>
        {t(
          'All managed devices have been scanned. No CVEs were found affecting images currently deployed across your fleets and devices.',
        )}
      </Alert>
    );
  }

  return (
    <Alert variant="info" title={t('No vulnerability data to display')}>
      {t('There are currently no deployed devices. Scan results will be available once devices have been added.')}
    </Alert>
  );
};
