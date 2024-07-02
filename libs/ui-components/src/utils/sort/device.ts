import { Device, EnrollmentRequest } from '@flightctl/types';
import { getDeviceFleet } from '../devices';
import { getApprovalStatus } from '../status/enrollmentRequest';
import { EnrollmentRequestStatus } from '../status/common';

import {
  deviceStatusOrder,
  getApplicationSummaryStatus,
  getDeviceSummaryStatus,
  getSystemUpdateStatus,
} from '../status/devices';
import { DeviceLikeResource, isEnrollmentRequest } from '../../types/extraTypes';
import { applicationSummaryStatusOrder } from '../status/applications';
import { systemUpdateStatusOrder } from '../status/system';

const sortEnrollmentRequests = (aStatus: EnrollmentRequestStatus, bStatus: EnrollmentRequestStatus) => {
  // Sort when both are EnrollmentRequests
  if (aStatus === EnrollmentRequestStatus.Pending || bStatus === EnrollmentRequestStatus.Pending) {
    if (aStatus === bStatus) {
      return 0;
    }
    return aStatus === EnrollmentRequestStatus.Pending ? -1 : 1;
  }
  return aStatus.localeCompare(bStatus);
};

const sortByApplicationStatus = (a: Device, b: Device) => {
  const aStatus = getApplicationSummaryStatus(a.status?.applications.summary);
  const bStatus = getApplicationSummaryStatus(b.status?.applications.summary);

  const aIndex = applicationSummaryStatusOrder.indexOf(aStatus);
  const bIndex = applicationSummaryStatusOrder.indexOf(bStatus);
  return aIndex - bIndex;
};

const sortByDeviceStatus = (a: Device, b: Device) => {
  const aStatus = getDeviceSummaryStatus(a.status?.summary);
  const bStatus = getDeviceSummaryStatus(b.status?.summary);

  const aIndex = deviceStatusOrder.indexOf(aStatus);
  const bIndex = deviceStatusOrder.indexOf(bStatus);
  return aIndex - bIndex;
};

const sortBySystemUpdateStatus = (a: Device, b: Device) => {
  const aStatus = getSystemUpdateStatus(a.status?.updated);
  const bStatus = getSystemUpdateStatus(b.status?.updated);

  const aIndex = systemUpdateStatusOrder.indexOf(aStatus);
  const bIndex = systemUpdateStatusOrder.indexOf(bStatus);
  return aIndex - bIndex;
};

export const sortDeviceStatus = (
  resources: Array<DeviceLikeResource>,
  status: 'DeviceStatus' | 'ApplicationStatus' | 'SystemUpdateStatus',
) =>
  resources.sort((a, b) => {
    const isERa = isEnrollmentRequest(a);
    const isERb = isEnrollmentRequest(b);

    if (isERa && isERb) {
      // Both are Enrollment requests
      const aStatus = getApprovalStatus(a);
      const bStatus = getApprovalStatus(b);
      return sortEnrollmentRequests(aStatus as EnrollmentRequestStatus, bStatus as EnrollmentRequestStatus);
    } else if (isERa || isERb) {
      // Only one is an EnrollmentRequest
      return isERa ? -1 : 1;
    }

    // Both are Devices
    switch (status) {
      case 'ApplicationStatus':
        return sortByApplicationStatus(a, b);
      case 'DeviceStatus':
        return sortByDeviceStatus(a, b);
      case 'SystemUpdateStatus':
        return sortBySystemUpdateStatus(a, b);
    }
  });

export const sortDevicesByFleet = (resources: Array<Device | EnrollmentRequest>) =>
  resources.sort((a, b) => {
    const aFleet = getDeviceFleet(a.metadata);
    const bFleet = getDeviceFleet(b.metadata);

    if (!aFleet && !bFleet) {
      // sort ERs first, then Devices
      if (isEnrollmentRequest(a) && !isEnrollmentRequest(b)) {
        return -1;
      }
      if (isEnrollmentRequest(b) && !isEnrollmentRequest(a)) {
        return 1;
      }
    }
    return (aFleet || '-').localeCompare(bFleet || '-');
  });
