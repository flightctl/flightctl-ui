import { ObjectMeta } from '@flightctl/types';
import { DeviceLikeResource, isDevice } from '../../types/extraTypes';

export const sortByName = <R extends { metadata: ObjectMeta }>(resources: R[]) =>
  resources.sort((a, b) => {
    const aName = a.metadata.name || '-';
    const bName = b.metadata.name || '-';
    return aName.localeCompare(bName);
  });

export const sortByLastSeenDate = (resources: DeviceLikeResource[]) =>
  resources.sort((a, b) => {
    const getDate = (resource: DeviceLikeResource) => {
      if (isDevice(resource)) {
        const lastSeen = resource.status?.lastSeen;
        if (lastSeen) {
          return lastSeen;
        }
      }
      return resource.metadata.creationTimestamp || 0;
    };

    const aDate = getDate(a);
    const bDate = getDate(b);
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });

export const sortByAlias = <R extends { metadata: ObjectMeta }>(resources: R[]) =>
  resources.sort((a, b) => {
    const aAlias = a.metadata.labels?.alias || '-';
    const bAlias = b.metadata.labels?.alias || '-';
    return aAlias.localeCompare(bAlias);
  });
