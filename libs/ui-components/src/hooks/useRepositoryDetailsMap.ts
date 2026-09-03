import * as React from 'react';

import { type Repository } from '@flightctl/types';
import { type ConfigSourceProvider, getRepoName, isRepoConfig } from '../types/deviceSpec';
import { isPromiseRejected } from '../types/typeUtils';
import { getErrorMessage } from '../utils/error';
import { getRepoUrlOrRegistry } from '../components/Repository/CreateRepository/utils';
import { useFetch } from './useFetch';

export type RepositoryDetails = {
  url?: string;
  errorMsg?: string;
};

const useStableStringArray = (array: string[]) => {
  const prevArrayRef = React.useRef(array);

  if (prevArrayRef.current.length !== array.length || prevArrayRef.current.some((item) => !array.includes(item))) {
    prevArrayRef.current = array;
  }

  return prevArrayRef.current;
};

export const useRepositoryDetailsMap = (configs: ConfigSourceProvider[]) => {
  const { get } = useFetch();
  const repoConfigs = configs.filter(isRepoConfig);
  const repositoryNames = useStableStringArray(repoConfigs.map(getRepoName));
  const [repoDetailsMap, setRepoDetailsMap] = React.useState<Record<string, RepositoryDetails>>({});
  const [isLoading, setIsLoading] = React.useState(repositoryNames.length > 0);

  React.useEffect(() => {
    if (repositoryNames.length === 0) {
      setRepoDetailsMap({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const fetchRepositories = async () => {
      const promises = repositoryNames.map((repoName) => get<Repository>(`repositories/${repoName}`));
      const results = await Promise.allSettled(promises);

      const map: Record<string, RepositoryDetails> = {};
      results.forEach((result, index) => {
        const repoName = repositoryNames[index];
        if (isPromiseRejected(result)) {
          map[repoName] = { errorMsg: getErrorMessage(result.reason) };
          return;
        }

        map[repoName] = { url: getRepoUrlOrRegistry(result.value.spec) };
      });

      setRepoDetailsMap(map);
      setIsLoading(false);
    };

    void fetchRepositories();
  }, [get, repositoryNames]);

  return {
    repoDetailsMap,
    isLoading,
  };
};
