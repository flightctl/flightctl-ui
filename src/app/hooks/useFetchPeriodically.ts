import * as React from 'react';
import { fetchData, fetchMetrics } from '@app/old/utils/commonFunctions';
import { FlightControlQuery } from '@app/types/extraTypes';
import { getQueryStringHash, getRequestQueryString, isApiQuery } from '@app/utils/api';

import { useAuth } from './useAuth';

const TIMEOUT = 10000;

export const useFetchPeriodically = <R>(query: FlightControlQuery): [R | undefined, boolean, unknown, VoidFunction] => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [data, setData] = React.useState<R>();
  const [error, setError] = React.useState<unknown>();
  const [forceUpdate, setForceUpdate] = React.useState(0);
  const auth = useAuth();
  const ref = React.useRef(0);

  const userToken = auth?.user?.access_token;

  // When the query parameters change, the hash will too. We must perform a refetch outside the timeout loop
  const queryStringHash = getQueryStringHash(query);
  const isAPI = isApiQuery(query);

  // Callback that generates the updated query for refreshes. It may provide updated values for parameters such as from/to for metric queries
  const getRequestQuery = React.useCallback(() => getRequestQueryString(query), [query])

  React.useEffect(() => {
    let abortController: AbortController;

    const fetchPeriodically = async (id: number) => {
      while (ref.current === id) {
        try {
          abortController = new AbortController();

          const requestQuery = getRequestQuery();

          const fetchFn = isAPI ? fetchData : fetchMetrics;
          const data = await fetchFn(requestQuery, auth?.user?.access_token, abortController.signal);
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
  }, [userToken, forceUpdate, queryStringHash, isAPI]);

  const refetch = React.useCallback(() => setForceUpdate((val) => val + 1), []);

  return [data, isLoading, error, refetch];
};
