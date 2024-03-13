import { ResourceSync } from '@types';
import { getObservedHash, getRepositorySyncStatus } from '../status/repository';

export const sortResourceSyncsByPath = (resources: ResourceSync[]) =>
  resources.sort((a, b) => {
    const aPath = a.spec.path || '-';
    const bPath = b.spec.path || '-';
    return aPath.localeCompare(bPath);
  });

export const sortResourceSyncsByRevision = (resources: ResourceSync[]) =>
  resources.sort((a, b) => {
    const aRevision = a.spec.targetRevision || '-';
    const bRevision = b.spec.targetRevision || '-';
    return aRevision.localeCompare(bRevision);
  });

export const sortResourceSyncsByStatus = (resources: ResourceSync[]) =>
  resources.sort((a, b) => {
    const aStatus = getRepositorySyncStatus(a);
    const bStatus = getRepositorySyncStatus(b);
    return aStatus.status.localeCompare(bStatus.status);
  });

export const sortResourceSyncsByHash = (resources: ResourceSync[]) =>
  resources.sort((a, b) => {
    const aHash = getObservedHash(a) || '-';
    const bHash = getObservedHash(b) || '-';
    return aHash.localeCompare(bHash);
  });
