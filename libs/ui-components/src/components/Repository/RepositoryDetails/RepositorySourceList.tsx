import React from 'react';
import { List, ListItem, Spinner } from '@patternfly/react-core';

import { Repository } from '@flightctl/types';
import { useFetch } from '../../../hooks/useFetch';
import { ConfigSourceProvider, getRepoName, isRepoConfig } from '../../../types/deviceSpec';
import { isPromiseRejected } from '../../../types/typeUtils';
import { getErrorMessage } from '../../../utils/error';
import { getConfigDetails } from './RepositorySource';

const useArrayEq = (array: string[]) => {
  const prevArrayRef = React.useRef(array);

  if (prevArrayRef.current.length !== array.length || prevArrayRef.current.some((item) => !array.includes(item))) {
    prevArrayRef.current = array;
  }

  return prevArrayRef.current;
};

type RepoLoadDetails = { url?: string; errorMsg?: string };

const RepositorySourceList = ({ configs }: { configs: Array<ConfigSourceProvider> }) => {
  const { get } = useFetch();
  const repoConfigs = configs.filter(isRepoConfig);

  // Map indexed by repository name, with the result of fetching the repository details
  const [repoDetailsMap, setRepoDetailsMap] = React.useState<Record<string, Record<string, RepoLoadDetails>>>({});

  const repoConfigNames = useArrayEq(repoConfigs.map((config) => config.name));
  const repositoryNames = useArrayEq(repoConfigs.map(getRepoName));
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const fetch = async () => {
      const promises = repositoryNames.map((repoName) => get<Repository>(`repositories/${repoName}`));
      const results = await Promise.allSettled(promises);

      const map = {};
      results.forEach((result, index) => {
        const isRepoMissing = isPromiseRejected(result);
        const repoName = repositoryNames[index];

        const repoInfo: { url?: string; errorMsg?: string } = {};
        if (isRepoMissing) {
          repoInfo.errorMsg = getErrorMessage(result.reason);
        } else {
          repoInfo.url = result.value.spec.url;
        }
        map[repoName] = repoInfo;
      });
      setRepoDetailsMap(map);
      setIsLoading(false);
    };

    void fetch();
  }, [get, repoConfigNames, repositoryNames]);

  if (isLoading) {
    return <Spinner size="sm" />;
  }

  return configs.length > 0 ? (
    <List>
      {configs.map((config) => {
        let extraArgs = {};
        if (isRepoConfig(config)) {
          const repoName = getRepoName(config);
          extraArgs = repoDetailsMap[repoName] || {};
        }
        return <ListItem key={config.name}>{getConfigDetails(config, extraArgs)}</ListItem>;
      })}
    </List>
  ) : (
    '-'
  );
};

export default RepositorySourceList;
