import * as React from 'react';
import { Trans } from 'react-i18next';
import { DeviceSummaryStatusType, Fleet } from '@flightctl/types';

import { SystemRestoreBanners } from '../../SystemRestore/SystemRestoreBanners';
import { fromAPILabel, labelToExactApiMatchString } from '../../../utils/labels';
import { useTranslation } from '../../../hooks/useTranslation';

const FleetRestoreBanner = ({ fleet, refetch }: { fleet?: Fleet; refetch: VoidFunction }) => {
  const { t } = useTranslation();
  if (!fleet) {
    return null;
  }

  const fleetId = fleet.metadata.name as string;

  const fleetDeviceStatuses = fleet?.status?.devicesSummary?.summaryStatus;
  const suspendedDevicesCountNum =
    fleetDeviceStatuses?.[DeviceSummaryStatusType.DeviceSummaryStatusConflictPaused] || 0;
  const suspendedDevicesCount = suspendedDevicesCountNum.toString();

  return (
    <SystemRestoreBanners
      mode="fleet"
      summaryStatus={fleetDeviceStatuses}
      resumeAction={{
        actionText: t('Resume all'),
        title: (
          <Trans t={t} count={suspendedDevicesCountNum}>
            You are about to resume all<strong>{suspendedDevicesCount}</strong> suspended devices in{' '}
            <strong>{fleetId}</strong>
          </Trans>
        ),
        requestSelector: {
          labelSelector: fromAPILabel(fleet.spec.selector?.matchLabels || {})
            .map(labelToExactApiMatchString)
            .join(','),
        },
      }}
      onResumeComplete={refetch}
      className="pf-v5-u-pt-0 pf-v5-u-px-lg"
    />
  );
};

export default FleetRestoreBanner;
