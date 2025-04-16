import * as React from 'react';
import { ApiQuery } from '../types/extraTypes';
import { getQueryStringHash, getRequestQueryString } from '../utils/api';

import { useFetch } from './useFetch';

const TIMEOUT = 10000;

export const useFetchPeriodically = <R>(
  query: ApiQuery,
  onFetchComplete?: (data: R) => void,
): [R | undefined, boolean, unknown, VoidFunction, boolean] => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [data, setData] = React.useState<R>();
  const [error, setError] = React.useState<unknown>();
  const [forceUpdate, setForceUpdate] = React.useState(0);
  const ref = React.useRef(0);
  const prevResolvedQueryHash = React.useRef<string>();

  const { get } = useFetch();

  // When the query parameters change, the hash will too. We must perform a refetch outside the timeout loop
  const queryStringHash = getQueryStringHash(query);

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
            if (id > 0 && prevResolvedQueryHash.current !== queryStringHash) {
              setIsUpdating(true);
            }

            const data = (await get<R>(requestQuery, abortController.signal)) as R;
            if (isLoading) {
              setIsLoading(false);
            }
            setIsUpdating(false);

            if (onFetchComplete) {
              onFetchComplete(data); // Data might be mutated at this point
              setData(data);
            } else {
              setData(data);
            }
            setError(undefined);
          } catch (err) {
            // aborting fetch trows 'AbortError', we can ignore it
            if (abortController.signal.aborted) {
              return;
            }
            setError(err);
            setIsLoading(false);
            setIsUpdating(false);
          }
        } else {
          setIsLoading(false);
          setError(undefined);
          setData(undefined);
        }
        prevResolvedQueryHash.current = queryStringHash;
        await new Promise((resolve) => setTimeout(resolve, query.timeout || TIMEOUT));
      }
    };

    fetchPeriodically(ref.current);
    return () => {
      // eslint-disable-next-line
      ref.current++;
      abortController?.abort();
    };
    // eslint-disable-next-line
  }, [get, forceUpdate, queryStringHash]);

  const refetch = React.useCallback(() => setForceUpdate((val) => val + 1), []);

  return [data, isLoading, error, refetch, isUpdating];
};
