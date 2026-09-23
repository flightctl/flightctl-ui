import * as React from 'react';

import { type RepositoryList } from '@flightctl/types';

import { useFetch } from './useFetch';

export const useExistingDeltaStorageTarget = (excludeRepoName?: string) => {
  const { get } = useFetch();
  const [existingDeltaTargetName, setExistingDeltaTargetName] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const abortController = new AbortController();
    setIsLoading(true);

    const loadExistingDeltaRepo = async () => {
      try {
        const repoList = await get<RepositoryList>(
          'repositories?fieldSelector=spec.deltaStorageTarget=true&limit=1',
          abortController.signal,
        );
        const deltaStorageRepo = repoList.items.find((repo) => repo.metadata.name !== excludeRepoName);
        if (!abortController.signal.aborted) {
          setExistingDeltaTargetName(deltaStorageRepo?.metadata.name);
        }
      } catch {
        if (!abortController.signal.aborted) {
          setExistingDeltaTargetName(undefined);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadExistingDeltaRepo();
    return () => {
      abortController.abort();
    };
  }, [excludeRepoName, get]);

  return {
    existingDeltaTargetName,
    isLoading,
  };
};
