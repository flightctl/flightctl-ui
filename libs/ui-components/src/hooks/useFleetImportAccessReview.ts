import { AccessReviewResult, useAccessReview } from './useAccessReview';
import { RESOURCE, VERB } from '../types/rbac';

export const useFleetImportAccessReview = (): AccessReviewResult => {
  const canCreateRs = useAccessReview(RESOURCE.RESOURCE_SYNC, VERB.CREATE);
  const canReadRepo = useAccessReview(RESOURCE.REPOSITORY, VERB.LIST);
  return [canCreateRs[0] && canReadRepo[0], canCreateRs[1] || canReadRepo[1], canCreateRs[2] || canReadRepo[2]];
};
