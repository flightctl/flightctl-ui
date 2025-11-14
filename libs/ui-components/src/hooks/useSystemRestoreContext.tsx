import * as React from 'react';
import { DeviceSummaryStatusType, DevicesSummary } from '@flightctl/types';
import { useDevicesSummary } from '../components/Device/DevicesPage/useDevices';
import { useAccessReview } from './useAccessReview';
import { RESOURCE, VERB } from '../types/rbac';

interface SystemRestoreContextData {
  summaryStatus: DevicesSummary['summaryStatus'] | undefined;
  isLoading: boolean;
  pendingSyncCount: number;
  suspendedCount: number;
}

const SystemRestoreContext = React.createContext<SystemRestoreContextData | undefined>(undefined);

/**
 * Provider that fetches global (unfiltered) devices summary for system restore alerts.
 * This provides data needed for showing consistent restore banners across all pages.
 */
export const SystemRestoreProvider = ({ children }: React.PropsWithChildren) => {
  const [permissions] = useAccessReview([{ kind: RESOURCE.DEVICE, verb: VERB.LIST }]);
  const [canListDevices = false] = permissions;

  // We obtain the unfiltered device summary to detect if any devices are in system restore statuses
  const [devicesSummary, isLoading] = useDevicesSummary({});

  const contextValue = React.useMemo(() => {
    const pendingSyncCount = canListDevices
      ? devicesSummary?.summaryStatus?.[DeviceSummaryStatusType.DeviceSummaryStatusAwaitingReconnect] || 0
      : 0;

    const suspendedCount = canListDevices
      ? devicesSummary?.summaryStatus?.[DeviceSummaryStatusType.DeviceSummaryStatusConflictPaused] || 0
      : 0;

    return {
      summaryStatus: canListDevices ? devicesSummary?.summaryStatus : undefined,
      isLoading: canListDevices ? isLoading : false,
      pendingSyncCount,
      suspendedCount,
    };
  }, [devicesSummary, isLoading, canListDevices]);

  return <SystemRestoreContext.Provider value={contextValue}>{children}</SystemRestoreContext.Provider>;
};

export const useSystemRestore = (): SystemRestoreContextData => {
  const context = React.useContext(SystemRestoreContext);

  if (context === undefined) {
    throw new Error('useSystemRestore must be used within a SystemRestoreProvider');
  }

  return context;
};
