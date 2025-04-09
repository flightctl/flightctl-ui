import { useAppContext } from './useAppContext';

export const useFetch = () => {
  const { fetch, getCliArtifacts, getMetrics } = useAppContext();

  return {
    ...fetch,
    getCliArtifacts,
    getMetrics,
  };
};
