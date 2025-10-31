import * as React from 'react';
import { RESOURCE, VERB } from '../types/rbac';
import { usePermissionsContext } from '../components/common/PermissionsContext';
import { useFetch } from './useFetch';

// Alerts are considered disabled if:
// - Service returns 501 (Not Implemented) or 500 (Internal Server Error)
// - Service returns 401 (Unauthorized) - authentication issue with alerts service
const isDisabledAlertManagerService = (error: Error): boolean => {
  const errorCode = Number(error.message);
  return errorCode === 501 || errorCode === 500 || errorCode === 401;
};

export const useAlertsEnabled = (): boolean => {
  const { get } = useFetch();
  const [alertsEnabled, setAlertsEnabled] = React.useState(false);

  const { checkPermissions, loading: alertsLoading } = usePermissionsContext();
  const [canListAlerts] = checkPermissions([{ kind: RESOURCE.ALERTS, verb: VERB.LIST }]);

  React.useEffect(() => {
    let abortController: AbortController;

    const checkAlertServiceEnabled = async () => {
      try {
        abortController = new AbortController();
        await get('alerts', abortController.signal);
        setAlertsEnabled(true);
      } catch (err) {
        if (!abortController.signal.aborted) {
          if (isDisabledAlertManagerService(err as Error)) {
            setAlertsEnabled(false);
          } else {
            // For other errors, assume alerts are enabled but there's a temporary issue
            setAlertsEnabled(true);
          }
        }
      }
    };

    if (!alertsLoading && canListAlerts) {
      // Check only if we know that the user has permissions to read the alerts
      checkAlertServiceEnabled();
    } else {
      // If user doesn't have permissions, set to disabled
      setAlertsEnabled(false);
    }

    return () => {
      abortController?.abort();
    };
  }, [get, alertsLoading, canListAlerts]);

  return alertsEnabled;
};
