import React from 'react';
import { Divider, List, ListItem, Spinner, Stack, StackItem } from '@patternfly/react-core';

import { DependencySyncConfigRefStatus, DependencySyncStatus, Repository } from '@flightctl/types';
import { useFetch } from '../../../hooks/useFetch';
import { ConfigSourceProvider, getRepoName, isRepoConfig } from '../../../types/deviceSpec';
import { isPromiseRejected } from '../../../types/typeUtils';
import { getErrorMessage } from '../../../utils/error';
import ConfigSourceSyncDetails from './ConfigSourceSyncDetails';
import { getConfigDetails } from './RepositorySource';
import { getRepoUrlOrRegistry } from '../CreateRepository/utils';

const useArrayEq = (array: string[]) => {
  const prevArrayRef = React.useRef(array);

  if (prevArrayRef.current.length !== array.length || prevArrayRef.current.some((item) => !array.includes(item))) {
    prevArrayRef.current = array;
  }

  return prevArrayRef.current;
};

const getSyncRef = (
  configProviderName: string,
  dependencyStatus?: DependencySyncStatus,
): DependencySyncConfigRefStatus | null => {
  const syncRef = dependencyStatus?.configRefs?.find((ref) => ref.configProviderName === configProviderName);
  if (syncRef && (syncRef.fingerprint || syncRef.lastUpdatedAt)) {
    return syncRef;
  }
  return null;
};

type RepoLoadDetails = { url?: string; errorMsg?: string };

type RepositorySourceListProps = {
  configs: Array<ConfigSourceProvider>;
  dependencyStatus?: DependencySyncStatus;
};

const RepositorySourceList = ({ configs, dependencyStatus }: RepositorySourceListProps) => {
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
          repoInfo.url = getRepoUrlOrRegistry(result.value.spec);
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

  if (configs.length === 0) {
    return null;
  }

  return (
    <List isPlain>
      {configs.map((config, index) => {
        const addDivider = index !== configs.length - 1;

        let extraArgs = {};
        if (isRepoConfig(config)) {
          const repoName = getRepoName(config);
          extraArgs = repoDetailsMap[repoName] || {};
        }

        const syncRef = getSyncRef(config.name, dependencyStatus);
        return (
          <ListItem key={config.name}>
            <Stack>
              <StackItem>{getConfigDetails(config, extraArgs)}</StackItem>
              {syncRef && (
                <StackItem>
                  <ConfigSourceSyncDetails syncRef={syncRef} />
                </StackItem>
              )}
              {addDivider && (
                <StackItem className="pf-v6-u-my-sm">
                  <Divider
                    style={
                      { '--pf-v6-c-divider--Color': 'var(--pf-t--global--border--color--50)' } as React.CSSProperties
                    }
                  />
                </StackItem>
              )}
            </Stack>
          </ListItem>
        );
      })}
    </List>
  );
};

export default RepositorySourceList;
