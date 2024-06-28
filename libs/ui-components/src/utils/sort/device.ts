import { Device, DeviceSummaryStatusType, EnrollmentRequest } from '@flightctl/types';
import { getDeviceFleet } from '../devices';
import { getApprovalStatus } from '../status/enrollmentRequest';
import { EnrollmentRequestStatus as EnrollmentRequestStatusType } from '../status/common';

import { deviceStatusOrder, getDeviceSummaryStatus } from '../status/devices';
import { isEnrollmentRequest } from '../../types/extraTypes';

export const sortDevicesByStatus = (resources: Array<Device | EnrollmentRequest>) =>
  resources.sort((a, b) => {
    const isERa = isEnrollmentRequest(a);
    const isERb = isEnrollmentRequest(b);

    const aStatus = isERa ? getApprovalStatus(a) : getDeviceSummaryStatus(a.status);
    const bStatus = isERb ? getApprovalStatus(b) : getDeviceSummaryStatus(b.status);

    if (isERa && isERb) {
      // Sort when both are EnrollmentRequests
      if (aStatus === EnrollmentRequestStatusType.Pending || bStatus === EnrollmentRequestStatusType.Pending) {
        if (aStatus === bStatus) {
          return 0;
        }
        return aStatus === EnrollmentRequestStatusType.Pending ? -1 : 1;
      }
      return aStatus.localeCompare(bStatus);
    } else if (isERa || isERb) {
      // Sort when only one is an EnrollmentRequest
      return isERa ? -1 : 1;
    }

    // Sort when both are devices
    const aIndex = deviceStatusOrder.indexOf(aStatus as DeviceSummaryStatusType);
    const bIndex = deviceStatusOrder.indexOf(bStatus as DeviceSummaryStatusType);
    return aIndex - bIndex;
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
