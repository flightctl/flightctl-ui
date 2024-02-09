import { EnrollmentRequest } from '@types';

type ApprovalStatus = 'Approved' | 'Pending' | 'Denied';

export const getApprovalStatus = (enrollmentRequest: EnrollmentRequest): ApprovalStatus => {
  const approvedCondition = enrollmentRequest.status?.conditions?.find((c) => c.type === 'Approved');
  if (!approvedCondition) {
    return 'Pending';
  }
  if (approvedCondition.status === 'True') {
    return 'Approved';
  }
  return 'Denied';
};
