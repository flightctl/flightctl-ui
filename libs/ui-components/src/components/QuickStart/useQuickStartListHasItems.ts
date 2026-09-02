import { DeviceLifecycleStatusType, ResourceKind } from '@flightctl/types';
import { ResourceKind as ImageBuilderResourceKind } from '@flightctl/types/imagebuilder';

import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { type ApiList, getApiListCount } from '../../utils/api';

const enrolledDevicesStatuses = [
  DeviceLifecycleStatusType.DeviceLifecycleStatusEnrolled,
  DeviceLifecycleStatusType.DeviceLifecycleStatusUnknown,
];

type QuickStartListKind =
  | ResourceKind.DEVICE
  | ResourceKind.ENROLLMENT_REQUEST
  | ResourceKind.FLEET
  | ImageBuilderResourceKind.IMAGE_BUILD;

const getKindQuery = (kind: QuickStartListKind) => {
  switch (kind) {
    case ResourceKind.DEVICE:
      return `devices?fieldSelector=status.lifecycle.status in (${enrolledDevicesStatuses.join(',')})`;
    case ResourceKind.ENROLLMENT_REQUEST:
      return 'enrollmentrequests?fieldSelector=!status.approval.approved';
    case ResourceKind.FLEET:
      return 'fleets';
    case ImageBuilderResourceKind.IMAGE_BUILD as const:
      return 'imagebuilds';
    default:
      return '';
  }
};

/**
 * Opt-in list probe for a QuickStart step content component.
 * Polls a single list endpoint
 */
export const useQuickStartListHasItems = (kind: QuickStartListKind): { hasItems: boolean; isLoading: boolean } => {
  const query = getKindQuery(kind);
  const [list, isLoading] = useFetchPeriodically<ApiList>({
    endpoint: query ? `${query}&limit=1` : '',
  });

  const count = getApiListCount(list);
  const hasItems = !isLoading && count !== undefined && count > 0;

  return { hasItems, isLoading };
};
