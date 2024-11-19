import { ObjectMeta } from '@flightctl/types';

export const sortByName = <R extends { metadata: ObjectMeta }>(resources: R[]) =>
  resources.sort((a, b) => {
    const aName = a.metadata.name || '-';
    const bName = b.metadata.name || '-';
    return aName.localeCompare(bName);
  });
