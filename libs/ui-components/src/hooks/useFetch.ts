import { useAppContext } from './useAppContext';

export const useFetch = () => {
  const { fetch, metrics } = useAppContext();

  return {
    ...fetch,
    getMetrics: metrics.get,
  };
};
