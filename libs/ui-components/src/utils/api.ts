import {
  ConditionStatus,
  DeviceList,
  EnrollmentRequestList,
  FleetList,
  ObjectMeta,
  RepositoryList,
  ResourceSyncList,
} from '@flightctl/types';
import { ImageBuildList } from '@flightctl/types/imagebuilder';

import { AnnotationType, GenericCondition, GenericConditionType } from '../types/extraTypes';

export type ApiList =
  | EnrollmentRequestList
  | DeviceList
  | FleetList
  | RepositoryList
  | ResourceSyncList
  | ImageBuildList;

const getApiListCount = (listResponse: ApiList | undefined): number | undefined => {
  if (listResponse === undefined) {
    return undefined;
  }
  const hasItems = listResponse.items.length > 0;
  const extraItems = listResponse.metadata.remainingItemCount || 0;
  return hasItems ? 1 + extraItems : 0;
};

const getMetadataAnnotation = (metadata: ObjectMeta | undefined, annotation: AnnotationType) => {
  if (metadata?.annotations) {
    return metadata.annotations[annotation];
  }
  return undefined;
};

const getCondition = (
  conditions: GenericCondition[] | undefined,
  type: GenericConditionType,
  status: ConditionStatus = ConditionStatus.ConditionStatusTrue,
): GenericCondition | undefined => {
  const typeCond = conditions?.filter((c) => c.type === type);
  if (typeCond) {
    return typeCond.find((tc) => tc.status === status);
  }
  return undefined;
};

export { getMetadataAnnotation, getApiListCount, getCondition };
