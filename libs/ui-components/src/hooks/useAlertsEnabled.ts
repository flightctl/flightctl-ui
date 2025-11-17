import * as React from 'react';
import { RESOURCE, VERB } from '../types/rbac';
import { usePermissionsContext } from '../components/common/PermissionsContext';
import { useFetch } from './useFetch';

// Alerts are considered disabled if the service returns either 501 (Not Implemented) or 500
const isDisabledAlertManagerService = (error: Error): boolean =>
  Number(error.message) === 501 || Number(error.message) === 500;

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
