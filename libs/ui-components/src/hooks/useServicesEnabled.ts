import * as React from 'react';

import { RESOURCE, VERB } from '../types/rbac';
import { usePermissionsContext } from '../components/common/PermissionsContext';
import { useFetch } from './useFetch';

const alertManagerDisabledStatusCodes = [501, 500, 401];
const vulnerabilityDisabledStatusCodes = [501];

type ServiceEnabledConfig = {
  canList: boolean;
  loading: boolean;
  endpoint: string;
  disabledStatusCodes: number[];
};

// [isEnabled, canList, isLoading]
type ServiceEnabledResult = [boolean, boolean, boolean];

const useServiceEnabled = ({
  canList,
  loading,
  endpoint,
  disabledStatusCodes,
}: ServiceEnabledConfig): ServiceEnabledResult => {
  const { get } = useFetch();
  const [isEnabled, setIsEnabled] = React.useState(false);

  React.useEffect(() => {
    let abortController: AbortController;

    const checkServiceEnabled = async () => {
      try {
        abortController = new AbortController();
        await get(endpoint, abortController.signal);
        setIsEnabled(true);
      } catch (err) {
        if (!abortController.signal.aborted) {
          const errorMessage = err instanceof Error ? err.message : undefined;
          if (errorMessage && disabledStatusCodes.includes(Number(errorMessage))) {
            setIsEnabled(false);
          } else {
            // For unknown errors, assume service is enabled but temporarily unavailable.
            setIsEnabled(true);
          }
        }
      }
    };

    if (!loading && canList) {
      checkServiceEnabled();
    } else {
      setIsEnabled(false);
    }

    return () => {
      abortController?.abort();
    };
  }, [canList, endpoint, get, disabledStatusCodes, loading]);

  return [isEnabled, canList, loading];
};

export const useAlertsEnabled = (): ServiceEnabledResult => {
  const { checkPermissions, loading } = usePermissionsContext();
  const [canList] = checkPermissions([{ kind: RESOURCE.ALERTS, verb: VERB.LIST }]);

  return useServiceEnabled({
    canList,
    loading,
    endpoint: 'alerts',
    disabledStatusCodes: alertManagerDisabledStatusCodes,
  });
};

export const useVulnerabilitiesEnabled = (): ServiceEnabledResult => {
  const { checkPermissions, loading } = usePermissionsContext();
  const [canListVulnerabilities] = checkPermissions([{ kind: RESOURCE.VULNERABILITY, verb: VERB.LIST }]);

  return useServiceEnabled({
    canList: canListVulnerabilities,
    loading,
    endpoint: 'vulnerabilities/summary',
    disabledStatusCodes: vulnerabilityDisabledStatusCodes,
  });
};
