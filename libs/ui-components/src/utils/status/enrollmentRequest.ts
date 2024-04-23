import { ConditionType, EnrollmentRequest } from '@flightctl/types';

export enum ApprovalStatus {
  Pending = 'Pending approval',
  Approved = 'Approved',
  Denied = 'Denied',
  Unknown = 'Unknown',
}

export const getApprovalStatus = (enrollmentRequest: EnrollmentRequest): ApprovalStatus => {
  const approvedCondition = enrollmentRequest.status?.conditions?.find(
    (c) => c.type === ConditionType.EnrollmentRequestApproved,
  );
  if (!approvedCondition) {
    return ApprovalStatus.Pending;
  }
  if (approvedCondition.status === 'True') {
    return ApprovalStatus.Approved;
  }
  if (approvedCondition.status === 'False') {
    return ApprovalStatus.Denied;
  }
  return ApprovalStatus.Unknown;
};
