import { Device, EnrollmentRequest } from '@types';
import { getDeviceFleet } from '../devices';
import { isEnrollmentRequest } from '@app/components/Device/useDeviceFilters';
import { ApprovalStatus, getApprovalStatus } from '../status/enrollmentRequest';

export const sortDevicesByStatus = (resources: Array<Device | EnrollmentRequest>) =>
  resources.sort((a, b) => {
    const aStatus = isEnrollmentRequest(a) ? getApprovalStatus(a) : ApprovalStatus.Approved;
    const bStatus = isEnrollmentRequest(b) ? getApprovalStatus(b) : ApprovalStatus.Approved;
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

export const sortDevicesByOS = (resources: Array<Device | EnrollmentRequest>) =>
  resources.sort((a, b) => {
    const aOS =
      (isEnrollmentRequest(a)
        ? a.spec.deviceStatus?.systemInfo?.operatingSystem
        : a.status?.systemInfo?.operatingSystem) || '-';
    const bOS =
      (isEnrollmentRequest(b)
        ? b.spec.deviceStatus?.systemInfo?.operatingSystem
        : b.status?.systemInfo?.operatingSystem) || '-';
    return aOS.localeCompare(bOS);
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
