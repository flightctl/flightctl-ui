import { ObjectMeta } from '@types';

export const sortByName = <R extends { metadata: ObjectMeta }>(resources: R[]) =>
  resources.sort((a, b) => {
    const aFingerprint = a.metadata.name || '-';
    const bFingerprint = b.metadata.name || '-';
    return aFingerprint.localeCompare(bFingerprint);
  });

export const sortByCreationTimestamp = <R extends { metadata: ObjectMeta }>(resources: R[]) =>
  resources.sort((a, b) => {
    const aDate = a.metadata.creationTimestamp || 0;
    const bDate = b.metadata.creationTimestamp || 0;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

export const sortByDisplayName = <R extends { metadata: ObjectMeta }>(resources: R[]) =>
  resources.sort((a, b) => {
    const aName = a.metadata.labels?.displayName || '-';
    const bName = b.metadata.labels?.displayName || '-';
    return aName.localeCompare(bName);
  });

export const sortByOwner = <R extends { metadata: ObjectMeta }>(resources: R[]) =>
  resources.sort((a, b) => {
    const aOwner = a.metadata?.owner || '-';
    const bOwner = b.metadata?.owner || '-';
    return aOwner.localeCompare(bOwner);
  });
