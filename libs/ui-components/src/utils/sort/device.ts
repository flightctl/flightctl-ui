import { Device, EnrollmentRequest } from '@flightctl/types';
import { getDeviceFleet } from '../devices';
import { ApprovalStatus, getApprovalStatus } from '../status/enrollmentRequest';
import { DeviceConditionStatus, deviceStatusOrder, getDeviceStatus } from '../status/device';
import { isEnrollmentRequest } from '../../types/extraTypes';

export const sortDevicesByStatus = (resources: Array<Device | EnrollmentRequest>) =>
  resources.sort((a, b) => {
    const isERa = isEnrollmentRequest(a);
    const isERb = isEnrollmentRequest(b);

    const aStatus = isERa ? getApprovalStatus(a) : getDeviceStatus(a);
    const bStatus = isERb ? getApprovalStatus(b) : getDeviceStatus(b);

    if (isERa && isERb) {
      // Sort when both are EnrollmentRequests
      if (aStatus === ApprovalStatus.Pending || bStatus === ApprovalStatus.Pending) {
        if (aStatus === bStatus) {
          return 0;
        }
        return aStatus === ApprovalStatus.Pending ? -1 : 1;
      }
      return aStatus.localeCompare(bStatus);
    } else if (isERa || isERb) {
      // Sort when only one is an EnrollmentRequest
      return isERa ? -1 : 1;
    }

    // Sort when both are devices
    const aIndex = deviceStatusOrder.indexOf(aStatus as DeviceConditionStatus);
    const bIndex = deviceStatusOrder.indexOf(bStatus as DeviceConditionStatus);
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
