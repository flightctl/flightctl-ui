import * as React from 'react';
import { fetchMetrics } from '../utils/apiCalls';
import { useAuth } from './useAuth';

export const useMetrics = () => {
  const auth = useAuth();

  const userToken = auth?.user?.access_token;

  const get = React.useCallback(
    async <R>(query: string, abortSignal?: AbortSignal): Promise<R> => fetchMetrics(query, userToken, abortSignal),
    [userToken],
  );

  return {
    get,
  };
};
