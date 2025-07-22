import * as React from 'react';
import { useAppContext } from './useAppContext';
import { useAccessReview } from './useAccessReview';
import { RESOURCE, VERB } from '../types/rbac';

// AlertManager alert structure
type AlertManagerAlert = {
  fingerprint: string;
  labels: {
    alertname: string;
    org_id: string;
    resource: string;
    [key: string]: string;
  };
  annotations: Record<string, string>;
  startsAt: string;
  endsAt: string;
  updatedAt: string;
  status: {
    state: string;
    inhibitedBy: string[];
    mutedBy: string[];
    silencedBy: string[];
  };
  receivers: Array<{ name: string }>;
};

const DEFAULT_REFRESH_INTERVAL = 30000; // 30 seconds

export const useAlerts = (
  refreshInterval: number = DEFAULT_REFRESH_INTERVAL,
): [AlertManagerAlert[], boolean, unknown, VoidFunction] => {
  const { fetch } = useAppContext();
  const [alerts, setAlerts] = React.useState<AlertManagerAlert[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>();
  const [forceRefresh, setForceRefresh] = React.useState(0);

  const refetch = React.useCallback(() => {
    setForceRefresh((prev) => prev + 1);
  }, []);

  React.useEffect(() => {
    let abortController: AbortController;
    let intervalId: NodeJS.Timeout;

    const fetchAlerts = async () => {
      try {
        abortController = new AbortController();
        const alertsData = await fetch.getAlerts<AlertManagerAlert[]>(abortController.signal);
        setAlerts(alertsData || []);
        setError(undefined);
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(err);
          setAlerts([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchAlerts();

    // Set up periodic refresh
    if (refreshInterval > 0) {
      intervalId = setInterval(() => {
        fetchAlerts();
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      abortController?.abort();
    };
  }, [fetch, refreshInterval, forceRefresh]);

  return [alerts, isLoading, error, refetch];
};

// Type guard to check if error is HttpError with status property
const isHttpError = (error: unknown): error is { status: number } => {
  const errorObj = error as Record<string, unknown>;
  return typeof error === 'object' && error !== null && 'status' in error && typeof errorObj.status === 'number';
};

export const useAlertsEnabled = (): boolean => {
  const { fetch } = useAppContext();
  const [alertsEnabled, setAlertsEnabled] = React.useState(false);

  const [canListAlerts, alertsLoading] = useAccessReview(RESOURCE.ALERTS, VERB.LIST);
  const checkServiceEnabled = !alertsLoading && canListAlerts;

  React.useEffect(() => {
    let abortController: AbortController;

    const checkAlertServiceEnabled = async () => {
      try {
        abortController = new AbortController();
        await fetch.getAlerts<AlertManagerAlert[]>(abortController.signal);
        setAlertsEnabled(true);
      } catch (err) {
        if (!abortController.signal.aborted) {
          // Check if AlertManager is disabled (501 Not Implemented) or unavailable (500 Internal Server Error)
          if (isHttpError(err) && (err.status === 501 || err.status === 500)) {
            setAlertsEnabled(false);
          } else {
            // For other errors, assume alerts are enabled but there's a temporary issue
            setAlertsEnabled(true);
          }
        }
      }
    };

    if (checkServiceEnabled) {
      // Check only if we know that the user has permisions to read the alerts
      checkAlertServiceEnabled();
    }

    return () => {
      abortController?.abort();
    };
  }, [fetch, checkServiceEnabled]);

  return alertsEnabled;
};

export type { AlertManagerAlert };
