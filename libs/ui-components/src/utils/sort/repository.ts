import { RepoSpecType, Repository } from '@flightctl/types';
import { getRepositoryLastTransitionTime, getRepositorySyncStatus } from '../status/repository';

export const sortRepositoriesByUrl = (resources: Repository[]) =>
  resources.sort((a, b) => {
    const aUrl = a.spec.url || '-';
    const bUrl = b.spec.url || '-';
    return aUrl.localeCompare(bUrl);
  });

export const sortRepositoriesBySyncStatus = (resources: Repository[]) =>
  resources.sort((a, b) => {
    const aStatus = getRepositorySyncStatus(a);
    const bStatus = getRepositorySyncStatus(b);
    return aStatus.status.localeCompare(bStatus.status);
  });

export const sortRepositoriesByLastTransition = (resources: Repository[]) =>
  resources.sort((a, b) => {
    const aTransition = getRepositoryLastTransitionTime(a).timestamp;
    const bTransition = getRepositoryLastTransitionTime(b).timestamp;
    return new Date(bTransition).getTime() - new Date(aTransition).getTime();
  });

export const sortRepositoriesByType = (resources: Repository[]) =>
  resources.sort((a, b) => {
    return (a.spec.type || RepoSpecType.GIT).localeCompare(b.spec.type || RepoSpecType.GIT);
  });
