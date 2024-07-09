import { TFunction } from 'i18next';
import { ConditionType, DeviceSummaryStatusType as DeviceSummaryStatus, EnrollmentRequest } from '@flightctl/types';
import { EnrollmentRequestStatus, FilterSearchParams, StatusItem } from './common';
import { PauseCircleIcon } from '@patternfly/react-icons/dist/js/icons/pause-circle-icon';

export const getEnrollmentRequestsStatusItems = (
  t: TFunction,
): StatusItem<DeviceSummaryStatus | EnrollmentRequestStatus>[] => [
  {
    type: FilterSearchParams.DeviceStatus,
    id: EnrollmentRequestStatus.Pending,
    label: t('Pending approval'),
    level: 'info',
    customIcon: PauseCircleIcon,
  },
  {
    type: FilterSearchParams.DeviceStatus,
    id: EnrollmentRequestStatus.Approved,
    label: t('Approved'),
    level: 'success',
  },
  {
    type: FilterSearchParams.DeviceStatus,
    id: EnrollmentRequestStatus.Denied,
    label: t('Denied'),
    level: 'warning',
  },
  {
    type: FilterSearchParams.DeviceStatus,
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
