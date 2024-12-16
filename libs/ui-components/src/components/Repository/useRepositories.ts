import { useDebounce } from 'use-debounce';

import { Repository, RepositoryList } from '@flightctl/types';

import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { PaginationDetails, useTablePagination } from '../../hooks/useTablePagination';

import { PAGE_SIZE } from '../../constants';

type RepositoriesEndpointArgs = {
  nextContinue?: string;
};

const getRepositoriesEndpoint = ({ nextContinue }: RepositoriesEndpointArgs) => {
  const params = new URLSearchParams({});

  if (nextContinue !== undefined) {
    params.set('limit', `${PAGE_SIZE}`);
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

export const useRepositories = (): [
  Repository[],
  boolean,
  unknown,
  boolean,
  VoidFunction,
  Pick<PaginationDetails, 'currentPage' | 'setCurrentPage' | 'itemCount'>,
] => {
  const { currentPage, setCurrentPage, itemCount, nextContinue, onPageFetched } = useTablePagination();
  const [repoEndpoint, isDebouncing] = useRepositoriesEndpoint({ nextContinue });

  const [repoList, isLoading, error, refetch] = useFetchPeriodically<RepositoryList>(
    {
      endpoint: repoEndpoint,
    },
    onPageFetched,
  );

  const pagination = {
    currentPage,
    setCurrentPage,
    itemCount,
  };

  return [repoList?.items || [], isLoading, error, isLoading || isDebouncing, refetch, pagination];
};
