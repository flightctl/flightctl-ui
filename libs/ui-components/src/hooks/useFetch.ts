import { useAppContext } from './useAppContext';

export const useFetch = () => {
  const { fetch } = useAppContext();

  return {
    ...fetch,
  };
};
