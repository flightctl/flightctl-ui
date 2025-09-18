import * as React from 'react';
import { DeviceResumeRequest, DeviceSummaryStatusType, DevicesSummary } from '@flightctl/types';
import { useSystemRestore } from '../../hooks/useSystemRestoreContext';
import SuspendedDevicesAlert, { ResumeMode } from './SuspendedDevicesAlert';
import { PendingSyncDevicesAlert } from './PendingSyncDevicesAlert';

import './SystemRestoreBanners.css';

interface SystemRestoreBannersProps {
  mode: ResumeMode;
  // Allows the banner to have an extra resume action for a subset of devices
  resumeAction?: {
    actionText: string;
    title: React.ReactNode;
    requestSelector: DeviceResumeRequest;
  };
  summaryStatus?: DevicesSummary['summaryStatus'];
  onResumeComplete?: VoidFunction;
  className?: string;
}

/**
 * Uses the received devicesSummary to show the pending sync and suspended devices banners
 */
export const SystemRestoreBanners = ({
  mode,
  resumeAction,
  summaryStatus,
  onResumeComplete,
  className,
}: SystemRestoreBannersProps) => {
  const pendingSyncCount = summaryStatus?.[DeviceSummaryStatusType.DeviceSummaryStatusAwaitingReconnect] || 0;
  const suspendedCount = summaryStatus?.[DeviceSummaryStatusType.DeviceSummaryStatusConflictPaused] || 0;

  const showPendingSyncBanner = pendingSyncCount > 0;
  const showSuspendedBanner = suspendedCount > 0;

  if (!showPendingSyncBanner && !showSuspendedBanner) {
    return null;
  }

  return (
    <div className={`fctl-system-restore-banners ${className}`}>
      {showPendingSyncBanner && <PendingSyncDevicesAlert forSingleDevice={mode === 'device'} />}

      {showSuspendedBanner && (
        <SuspendedDevicesAlert
          mode={mode}
          suspendedCount={suspendedCount}
          extraAction={resumeAction}
          onResumeComplete={onResumeComplete}
        />
      )}
    </div>
  );
};

/**
 * Shows the banners related to device summary data based on all existing devices
 */
export const GlobalSystemRestoreBanners = ({
  onResumeComplete,
  className,
}: {
  onResumeComplete?: VoidFunction;
  className?: string;
}) => {
  const { summaryStatus, isLoading } = useSystemRestore();

  if (isLoading) {
    return null;
  }

  return (
    <SystemRestoreBanners
      mode="global"
      summaryStatus={summaryStatus}
      onResumeComplete={onResumeComplete}
      className={className}
    />
  );
};
