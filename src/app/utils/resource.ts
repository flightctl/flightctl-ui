import { ObjectMeta } from '@types';

export const getResourceId = <R extends { metadata: ObjectMeta }>(resource: R) => resource.metadata.name || '';
