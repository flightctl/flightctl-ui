import * as React from 'react';
import { fetchMetrics } from '@app/old/utils/commonFunctions';
import { FlightControlMetrics } from '@app/types/extraTypes';
import { buildQuery, getPeriodTimestamps } from '@app/utils/metrics';

import { useAuth } from './useAuth';

const TIMEOUT = 10000;

// TODO Try to reuse back into "useFetchPeriodically"
export const useFetchMetrics = <R>(metricNames: FlightControlMetrics[], period: string): [R | undefined, boolean, unknown, VoidFunction] => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [data, setData] = React.useState<R>();
  const [error, setError] = React.useState<unknown>();
  const [forceUpdate, setForceUpdate] = React.useState(0);
  const auth = useAuth();
  const ref = React.useRef(0);

  const userToken = auth?.user?.access_token;

  React.useEffect(() => {
    let abortController: AbortController;
    const fetchPeriodically = async (id: number) => {
      while (ref.current === id) {
        try {
          abortController = new AbortController();

          // Rebuilding the query to obtain the updated "from" / "to" instants
          const metricsQuery = buildQuery({
            metrics: metricNames,
            range: getPeriodTimestamps(period),
          });
          const data = await fetchMetrics(metricsQuery, auth?.user?.access_token, abortController.signal);

          if (isLoading) {
            setIsLoading(false);
          }
          setData(data);
          setError(undefined);
        } catch (err) {
          // aborting fetch trows 'AbortError', we can ignore it
          if (!abortController.signal.aborted) {
            setError(err);
          }
          setIsLoading(false);
        }
        await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
      }
    };

    fetchPeriodically(ref.current);
    return () => {
      // eslint-disable-next-line
      ref.current++;
      abortController?.abort();
    };
    // eslint-disable-next-line
  }, [userToken, forceUpdate, metricNames, period]);

  const refetch = React.useCallback(() => setForceUpdate((val) => val + 1), []);

  return [data, isLoading, error, refetch];
};
