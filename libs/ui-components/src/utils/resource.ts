import { ObjectMeta, ResourceKind } from '@flightctl/types';

export const getOwnerName = (ownerKind: ResourceKind, owner: string | undefined): string | undefined => {
  if (!owner) {
    return undefined;
  }
  const prefix = `${ownerKind}/`;
  if (!owner.startsWith(prefix)) {
    return undefined;
  }
  const name = owner.slice(prefix.length);
  return name.length > 0 ? name : undefined;
};

export const getResourceId = <R extends { kind: string; metadata: ObjectMeta }>(resource: R) =>
  `${resource.kind}/${resource.metadata.name || ''}`;
