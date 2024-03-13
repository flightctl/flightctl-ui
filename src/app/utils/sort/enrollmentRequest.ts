import { EnrollmentRequest } from '@types';
import { getApprovalStatus } from '../status/enrollmentRequest';

export const sortERsByStatus = (resources: EnrollmentRequest[]) =>
  resources.sort((a, b) => {
    const aStatus = getApprovalStatus(a);
    const bStatus = getApprovalStatus(b);
    if (aStatus === 'Pending approval' && bStatus === 'Pending approval') {
      return 0;
    }
    if (aStatus === 'Pending approval') {
      return -1;
    }

    if (bStatus === 'Pending approval') {
      return 1;
    }
    return aStatus.localeCompare(bStatus);
  });
