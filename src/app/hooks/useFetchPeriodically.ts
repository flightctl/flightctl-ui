import * as React from 'react';
import { useAuth } from 'react-oidc-context';
import { fetchData } from '@app/old/utils/commonFunctions';

const TIMEOUT = 10000;

export const useFetchPeriodically = <R>(endpoint: string): [R | undefined, boolean, unknown, VoidFunction] => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [data, setData] = React.useState<R>();
  const [error, setError] = React.useState<unknown>();
  const [forceUpdate, setForceUpdate] = React.useState(0);
  const auth = useAuth();
  const ref = React.useRef(0);

  React.useEffect(() => {
    let abortController: AbortController;
    const fetchPeriodically = async (id: number) => {
      while (ref.current === id) {
        if (auth.user?.access_token) {
          try {
            abortController = new AbortController();
            const data = await fetchData(endpoint, auth.user.access_token, abortController.signal);
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
          }
          await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
        }
      }
    };

    fetchPeriodically(ref.current);
    return () => {
      // eslint-disable-next-line
      ref.current++;
      abortController?.abort();
    };
    // eslint-disable-next-line
  }, [auth.user?.access_token, forceUpdate, endpoint]);

  const refetch = React.useCallback(() => setForceUpdate((val) => val + 1), []);

  return [data, isLoading, error, refetch];
};
