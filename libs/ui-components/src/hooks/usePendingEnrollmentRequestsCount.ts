import { EnrollmentRequestList } from '@flightctl/types';

import { useFetchPeriodically } from './useFetchPeriodically';
import { getApiListCount } from '../utils/api';
import { usePermissionsContext } from '../components/common/PermissionsContext';
import { RESOURCE, VERB } from '../types/rbac';

type PendingEnrollmentRequestsCountResult = [number, boolean, unknown];
const forbiddenResult: PendingEnrollmentRequestsCountResult = [0, false, undefined];

export const usePendingEnrollmentRequestsCount = (): [number, boolean, unknown] => {
  const { checkPermissions } = usePermissionsContext();
  const [canList] = checkPermissions([{ kind: RESOURCE.ENROLLMENT_REQUEST_APPROVAL, verb: VERB.LIST }]);

  const [erList, loading, error] = useFetchPeriodically<EnrollmentRequestList>({
    endpoint: canList ? 'enrollmentrequests?fieldSelector=!status.approval.approved&limit=1' : '',
  });

  if (!canList) {
    return forbiddenResult;
  }

  return [getApiListCount(erList) || 0, loading, error];
};
