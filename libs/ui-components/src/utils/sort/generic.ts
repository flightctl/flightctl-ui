import { ObjectMeta } from '@flightctl/types';

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
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });

export const sortByDisplayName = <R extends { metadata: ObjectMeta }>(resources: R[]) =>
  resources.sort((a, b) => {
    const aName = a.metadata.labels?.['display-name'] || '-';
    const bName = b.metadata.labels?.['display-name'] || '-';
    return aName.localeCompare(bName);
  });
