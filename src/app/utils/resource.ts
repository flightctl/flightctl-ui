import { ObjectMeta } from '@types';

export const getResourceId = <R extends { kind: string; metadata: ObjectMeta }>(resource: R) =>
  `${resource.kind}/${resource.metadata.name || ''}`;
