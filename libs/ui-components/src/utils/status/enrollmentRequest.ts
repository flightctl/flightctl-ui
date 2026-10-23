import { PauseCircleIcon } from '@patternfly/react-icons/dist/js/icons/pause-circle-icon';
import { type TFunction } from 'i18next';
import { type Condition, ConditionStatus, ConditionType, type EnrollmentRequest } from '@flightctl/types';
import { type StatusItem } from './common';

export enum EnrollmentRequestStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Denied = 'Denied',
  Unknown = 'Unknown',
}

// The "TPM verification status" is a result of its "TPMVerified" condition.
export enum EnrollmentRequestTpmVerificationStatus {
  Verified = 'Verified', // fully verified
  Failed = 'Failed', // verification completed but failed
  Pending = 'Pending', // verification in progress (challenge required)
  NotAvailable = 'NotAvailable', // device does not have a TPM, or it's not available.
  Unknown = 'Unknown',
}

const TPM_CHALLENGE_REQUIRED_REASON = 'TPMChallengeRequired';

export const getEnrollmentRequestsStatusItems = (t: TFunction): StatusItem<EnrollmentRequestStatus>[] => [
  {
    id: EnrollmentRequestStatus.Pending,
    label: t('Pending approval'),
    level: 'info',
    customIcon: PauseCircleIcon,
  },
  {
    id: EnrollmentRequestStatus.Approved,
    label: t('Approved'),
    level: 'success',
  },
  {
    id: EnrollmentRequestStatus.Denied,
    label: t('Denied'),
    level: 'warning',
  },
  {
    id: EnrollmentRequestStatus.Unknown,
    label: t('Unknown'),
    level: 'unknown',
  },
];

export const getTpmVerificationStatusItems = (t: TFunction): StatusItem<EnrollmentRequestTpmVerificationStatus>[] => [
  {
    id: EnrollmentRequestTpmVerificationStatus.Verified,
    label: t('Verified'),
    level: 'success',
  },
  {
    id: EnrollmentRequestTpmVerificationStatus.Failed,
    label: t('Failed'),
    level: 'warning',
  },
  {
    id: EnrollmentRequestTpmVerificationStatus.Pending,
    label: t('Pending'),
    level: 'info',
    customIcon: PauseCircleIcon,
  },
  {
    id: EnrollmentRequestTpmVerificationStatus.NotAvailable,
    label: t('Not available'),
    level: 'unknown',
  },
  {
    id: EnrollmentRequestTpmVerificationStatus.Unknown,
    label: t('Unknown'),
    level: 'unknown',
  },
];

export const getApprovalStatus = (enrollmentRequest: EnrollmentRequest): EnrollmentRequestStatus => {
  const approvedCondition = enrollmentRequest.status?.conditions?.find(
    (c) => c.type === ConditionType.EnrollmentRequestApproved,
  );

  switch (approvedCondition?.status) {
    case 'True':
      return EnrollmentRequestStatus.Approved;
    case 'False':
      return EnrollmentRequestStatus.Denied;
  }
  return EnrollmentRequestStatus.Pending;
};

export const getTpmVerifiedCondition = (enrollmentRequest: EnrollmentRequest | undefined): Condition | undefined =>
  enrollmentRequest?.status?.conditions?.find((c) => c.type === ConditionType.EnrollmentRequestTPMVerified);

export const getTpmVerificationStatus = (
  tpmCondition: Condition | undefined,
): EnrollmentRequestTpmVerificationStatus => {
  if (!tpmCondition) {
    return EnrollmentRequestTpmVerificationStatus.NotAvailable;
  }

  if (tpmCondition.status === ConditionStatus.ConditionStatusTrue) {
    return EnrollmentRequestTpmVerificationStatus.Verified;
  }

  if (tpmCondition.reason === TPM_CHALLENGE_REQUIRED_REASON) {
    return EnrollmentRequestTpmVerificationStatus.Pending;
  }
  if (tpmCondition.status === ConditionStatus.ConditionStatusUnknown) {
    return EnrollmentRequestTpmVerificationStatus.Unknown;
  }

  return EnrollmentRequestTpmVerificationStatus.Failed;
};
