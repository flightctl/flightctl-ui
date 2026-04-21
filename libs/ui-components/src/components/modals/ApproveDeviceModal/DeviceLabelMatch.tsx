import * as React from 'react';
import { Trans } from 'react-i18next';
import { Flex, Spinner } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';

import { useTranslation } from '../../../hooks/useTranslation';
import { DeviceMatchStatus } from '../../../hooks/useDeviceLabelMatch';
import { StatusDisplayContent } from '../../Status/StatusDisplay';

export const DeviceLabelMatch = ({
  isApproval,
  matchStatus,
}: {
  isApproval: boolean;
  matchStatus: DeviceMatchStatus;
}) => {
  const { t } = useTranslation();

  if (matchStatus.status === 'checking') {
    return (
      <Flex gap={{ default: 'gapSm' }} role="status" aria-live="polite">
        <Spinner size="sm" aria-label={t('Checking for matching fleets')} />
        {t('Checking for matching fleets')}
      </Flex>
    );
  }

  switch (matchStatus.status) {
    case 'unchecked':
      return (
        <StatusDisplayContent
          level="info"
          label={t('Add labels to view matching fleet(s).')}
          customIcon={InfoCircleIcon}
        />
      );
    case 'unchecked--invalid':
      return (
        <StatusDisplayContent
          level="warning"
          label={t('Fix invalid labels to view matching fleet(s).')}
          customIcon={ExclamationTriangleIcon}
        />
      );
    case 'checked--unique': {
      const fleetName = matchStatus.detail || '';
      return (
        <StatusDisplayContent
          level="success"
          label={
            <Trans t={t} values={{ fleetName }}>
              Device matches fleet <strong>{fleetName}</strong>.
            </Trans>
          }
          customIcon={CheckCircleIcon}
        />
      );
    }
    case 'checked--empty':
      return <StatusDisplayContent level="warning" label={t('No fleets currently match the selected labels.')} />;
    case 'checked--multiple':
      const msg = isApproval
        ? t('Device labels match multiple fleets, therefore the device will not be bound to any fleet.')
        : t('Device labels match multiple fleets, therefore the device ownership will remain unchanged.');
      return <StatusDisplayContent level="danger" label={msg} customIcon={ExclamationTriangleIcon} />;
    case 'checked--error': {
      return (
        <StatusDisplayContent
          level="danger"
          label={t('Check for matching fleet(s) failed. {{errorMessage}}', {
            errorMessage: matchStatus.detail || t('Unknown error'),
          })}
          customIcon={ExclamationTriangleIcon}
        />
      );
    }
  }
};

export default DeviceLabelMatch;
