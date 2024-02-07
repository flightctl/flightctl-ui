import * as React from 'react';
import { useAuth } from './useAuth';
import { fetchData } from '@app/old/utils/commonFunctions';

export const useSingleFetch = <R>(apiPath: string): [R | undefined, boolean, unknown] => {
  const auth = useAuth();
  const token = auth?.user?.access_token;

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<R | undefined>();
  const [error, setError] = React.useState<string | undefined>();
  const needsLoading = !isLoading && !error && !data;

  React.useEffect(() => {
    const loadDetails = async () => {
      try {
        const apiData = await fetchData(apiPath, token);
        if (apiData) {
          setData(apiData);
          setError(undefined);
        } else {
          setError('Data not found');
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (needsLoading) {
      setIsLoading(true);
      void loadDetails();
    }
  }, [apiPath, needsLoading, token]);

  return [data, isLoading, error];
};
