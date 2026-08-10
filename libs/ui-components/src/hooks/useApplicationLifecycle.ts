import * as React from 'react';

import type { ApplicationStatusType, Device } from '@flightctl/types';

import {
  type ApplicationLifecycleAction,
  RESTART_PENDING_TIMEOUT_MS,
  shouldClearPendingLifecycleAction,
} from '../utils/applicationLifecycle';
import { getErrorMessage } from '../utils/error';
import { useFetch } from './useFetch';

type UseApplicationLifecycleArgs = {
  deviceName: string;
  appName: string;
  appStatus: ApplicationStatusType;
  appRestarts: number;
  refetch: VoidFunction;
};

type UseApplicationLifecycleResult = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  restart: () => Promise<void>;
  isSubmitting: boolean;
  pendingAction: ApplicationLifecycleAction | null;
  error: string | undefined;
  clearError: VoidFunction;
};

export const useApplicationLifecycle = ({
  deviceName,
  appName,
  appStatus,
  appRestarts,
  refetch,
}: UseApplicationLifecycleArgs): UseApplicationLifecycleResult => {
  const { post } = useFetch();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [pendingAction, setPendingAction] = React.useState<ApplicationLifecycleAction | null>(null);
  const statusAtRequestRef = React.useRef<ApplicationStatusType>(appStatus);
  const restartsAtRequestRef = React.useRef<number>();

  React.useEffect(() => {
    if (!pendingAction) {
      return;
    }

    if (
      shouldClearPendingLifecycleAction(
        pendingAction,
        appStatus,
        statusAtRequestRef.current,
        restartsAtRequestRef.current,
        appRestarts,
      )
    ) {
      setPendingAction(null);
      restartsAtRequestRef.current = undefined;
    }
  }, [appRestarts, appStatus, pendingAction]);

  React.useEffect(() => {
    if (pendingAction !== 'restart') {
      return;
    }

    // Restarting a running application does not produce an observable change in status.
    // If the action was successfully submitted, it is considered finished after a short timeout.
    const timer = window.setTimeout(() => {
      setPendingAction(null);
      restartsAtRequestRef.current = undefined;
    }, RESTART_PENDING_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [pendingAction]);

  const executeAction = React.useCallback(
    async (action: ApplicationLifecycleAction) => {
      setIsSubmitting(true);
      setError(undefined);

      try {
        statusAtRequestRef.current = appStatus;
        if (action === 'restart') {
          restartsAtRequestRef.current = appRestarts;
        } else {
          restartsAtRequestRef.current = undefined;
        }

        await post<Record<string, never>, Device>(
          `devices/${deviceName}/applications/${appName}/actions/${action}`,
          {},
        );
        setPendingAction(action);
        refetch();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    },
    [appName, appRestarts, appStatus, deviceName, post, refetch],
  );

  return {
    start: () => executeAction('start'),
    stop: () => executeAction('stop'),
    restart: () => executeAction('restart'),
    isSubmitting,
    pendingAction,
    error,
    clearError: () => setError(undefined),
  };
};
