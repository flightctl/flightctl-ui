import { useAppContext } from './useAppContext';

export const useFetch = () => {
  const { fetch, getCliArtifacts } = useAppContext();

  return {
    ...fetch,
    getCliArtifacts,
  };
};
