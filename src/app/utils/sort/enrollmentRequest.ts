import { EnrollmentRequest } from '@types';
import { ApprovalStatus, getApprovalStatus } from '../status/enrollmentRequest';

export const sortERsByStatus = (resources: EnrollmentRequest[]) =>
  resources.sort((a, b) => {
    const aStatus = getApprovalStatus(a);
    const bStatus = getApprovalStatus(b);
    if (aStatus === ApprovalStatus.Pending && bStatus === ApprovalStatus.Pending) {
      return 0;
    }
    if (aStatus === ApprovalStatus.Pending) {
      return -1;
    }

    if (bStatus === ApprovalStatus.Pending) {
      return 1;
    }
    return aStatus.localeCompare(bStatus);
  });
