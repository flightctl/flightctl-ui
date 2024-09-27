import * as React from 'react';
import { fetchMetrics } from '../utils/apiCalls';

export const useMetrics = () => {
  const get = React.useCallback(
    async <R>(query: string, abortSignal?: AbortSignal): Promise<R> => fetchMetrics(query, abortSignal),
    [],
  );

  return {
    get,
  };
};
