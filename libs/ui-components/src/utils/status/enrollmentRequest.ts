import { TFunction } from 'i18next';
import { ConditionType, EnrollmentRequest } from '@flightctl/types';
import { StatusItem } from './common';
import { PauseCircleIcon } from '@patternfly/react-icons/dist/js/icons/pause-circle-icon';

export enum EnrollmentRequestStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Denied = 'Denied',
  Unknown = 'Unknown',
}

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
