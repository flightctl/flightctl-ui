import { ConditionType, EnrollmentRequest } from '@types';
import { EnrollmentRequestApprovalStatus } from '@app/types/extraTypes';

export const getApprovalStatus = (enrollmentRequest?: EnrollmentRequest): EnrollmentRequestApprovalStatus => {
  const approvedCondition = enrollmentRequest?.status?.conditions?.find(
    (c) => c.type === ConditionType.EnrollmentRequestApproved,
  );
  if (!approvedCondition) {
    return 'Pending';
  }
  if (approvedCondition.status === 'True') {
    return 'Approved';
  }
  if (approvedCondition.status === 'False') {
    return 'Denied';
  }
  return 'Unknown';
};
