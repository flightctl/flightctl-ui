import * as React from 'react';
import { FlightControlQuery } from '../types/extraTypes';
import { getQueryStringHash, getRequestQueryString, isApiQuery } from '../utils/api';

import { useFetch } from './useFetch';

const TIMEOUT = 10000;

export const useFetchPeriodically = <R>(
  query: FlightControlQuery,
): [R | undefined, boolean, unknown, VoidFunction, boolean] => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [data, setData] = React.useState<R>();
  const [error, setError] = React.useState<unknown>();
  const [forceUpdate, setForceUpdate] = React.useState(0);
  const ref = React.useRef(0);

  const { get, getMetrics } = useFetch();

  // When the query parameters change, the hash will too. We must perform a refetch outside the timeout loop
  const queryStringHash = getQueryStringHash(query);
  const isAPI = isApiQuery(query);

  // Callback that generates the updated query for refreshes. It may provide updated values for parameters such as from/to for metric queries
  const getRequestQuery = React.useCallback(() => getRequestQueryString(query), [query]);

  React.useEffect(() => {
    let abortController: AbortController;

    const fetchPeriodically = async (id: number) => {
      while (ref.current === id) {
        const requestQuery = getRequestQuery();
        if (requestQuery) {
          try {
            abortController = new AbortController();
            if (id > 0) {
              setIsRefreshing(true);
            }

            const fetchFn = isAPI ? get : getMetrics;
            const data = await fetchFn(requestQuery, abortController.signal);
            if (isLoading) {
              setIsLoading(false);
            }
            setIsRefreshing(false);
            // eslint-disable-next-line
            setData(isAPI ? data : (data as any).data.result);
            setError(undefined);
          } catch (err) {
            // aborting fetch trows 'AbortError', we can ignore it
            if (abortController.signal.aborted) {
              return;
            }
            setError(err);
            setIsLoading(false);
            setIsRefreshing(false);
          }
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
  }, [get, getMetrics, forceUpdate, queryStringHash, isAPI]);

  const refetch = React.useCallback(() => setForceUpdate((val) => val + 1), []);

  return [data, isLoading, error, refetch, isRefreshing];
};
