import { ObjectMeta } from '@flightctl/types';
import { DeviceLikeResource, isDevice } from '../../types/extraTypes';

export const sortByName = <R extends { metadata: ObjectMeta }>(resources: R[]) =>
  resources.sort((a, b) => {
    const aFingerprint = a.metadata.name || '-';
    const bFingerprint = b.metadata.name || '-';
    return aFingerprint.localeCompare(bFingerprint);
  });

export const sortByLastSeenDate = (resources: DeviceLikeResource[]) =>
  resources.sort((a, b) => {
    const getDate = (resource: DeviceLikeResource) => {
      if (isDevice(resource)) {
        const updatedAt = resource.status?.updatedAt;
        if (updatedAt) {
          return updatedAt;
        }
      }
      return resource.metadata.creationTimestamp || 0;
    };

    const aDate = getDate(a);
    const bDate = getDate(b);
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });

export const sortByDisplayName = <R extends { metadata: ObjectMeta }>(resources: R[]) =>
  resources.sort((a, b) => {
    const aName = a.metadata.labels?.displayName || '-';
    const bName = b.metadata.labels?.displayName || '-';
    return aName.localeCompare(bName);
  });
