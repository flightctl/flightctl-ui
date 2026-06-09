import * as React from 'react';
import { useDebounce } from 'use-debounce';

import { Repository, RepositoryList } from '@flightctl/types';

import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { PaginationDetails, useTablePagination } from '../../hooks/useTablePagination';

import { PAGE_SIZE } from '../../constants';

type RepositoriesEndpointArgs = {
  name?: string;
  nextContinue?: string;
};

const getRepositoriesEndpoint = ({ name, nextContinue }: RepositoriesEndpointArgs) => {
  const params = new URLSearchParams();
  if (nextContinue !== undefined) {
    params.set('limit', `${PAGE_SIZE}`);
  }
  if (name) {
    params.set('fieldSelector', `metadata.name contains ${name}`);
  }
  if (nextContinue) {
    params.set('continue', nextContinue);
  }
  return `repositories?${params.toString()}`;
};

export const useRepositoriesEndpoint = (args: RepositoriesEndpointArgs): [string, boolean] => {
  const endpoint = getRepositoriesEndpoint(args);
  const [repositoriesEndpointDebounced] = useDebounce(endpoint, 1000);
  return [repositoriesEndpointDebounced, endpoint !== repositoriesEndpointDebounced];
};

export const useRepositories = (
  name: string | undefined,
): [
  Repository[],
  boolean,
  unknown,
  boolean,
  VoidFunction,
  Pick<PaginationDetails<RepositoryList>, 'currentPage' | 'setCurrentPage' | 'itemCount'>,
] => {
  const { currentPage, setCurrentPage, itemCount, nextContinue, onPageFetched } = useTablePagination<RepositoryList>();

  const prevNameRef = React.useRef(name);
  React.useEffect(() => {
    if (prevNameRef.current !== name) {
      prevNameRef.current = name;
      setCurrentPage(1);
    }
  }, [name, setCurrentPage]);

  const [repoEndpoint, isDebouncing] = useRepositoriesEndpoint({ name, nextContinue });

  const [repoList, isLoading, error, refetch] = useFetchPeriodically<RepositoryList>(
    {
      endpoint: repoEndpoint,
    },
    onPageFetched,
  );
  const pagination = React.useMemo(
    () => ({
      currentPage,
      setCurrentPage,
      itemCount,
    }),
    [currentPage, setCurrentPage, itemCount],
  );

  return [repoList?.items || [], isLoading, error, isLoading || isDebouncing, refetch, pagination];
};
