import { EnrollmentRequestList } from '@flightctl/types';

import { useFetchPeriodically } from './useFetchPeriodically';
import { getApiListCount } from '../utils/api';

export const usePendingEnrollmentRequestsCount = (): [number, boolean, unknown] => {
  const [erList, loading, error] = useFetchPeriodically<EnrollmentRequestList>({
    endpoint: 'enrollmentrequests?fieldSelector=!status.approval.approved&limit=1',
  });

  return [getApiListCount(erList) || 0, loading, error];
};
