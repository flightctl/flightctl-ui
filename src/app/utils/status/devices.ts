import { DeviceConditionStatus } from '@app/utils/status/device';
import { ApprovalStatus } from '@app/utils/status/enrollmentRequest';

type CombinedDevicesStatus = { key: string; label: DeviceConditionStatus | ApprovalStatus };

const buildUniqueStatuses = (): CombinedDevicesStatus[] => {
  const allUniqueStatuses: CombinedDevicesStatus[] = [];
  Object.keys(ApprovalStatus).forEach((approvalStatus) => {
    allUniqueStatuses.push({
      key: approvalStatus,
      label: ApprovalStatus[approvalStatus],
    });
  });
  Object.keys(DeviceConditionStatus).forEach((deviceStatus) => {
    // Approved is a shared status
    if (deviceStatus !== DeviceConditionStatus.Approved) {
      allUniqueStatuses.push({
        key: deviceStatus,
        label: DeviceConditionStatus[deviceStatus],
      });
    }
  });
  allUniqueStatuses.sort((a, b) => a.label.localeCompare(b.label));
  return allUniqueStatuses;
};

const combinedDevicesStatuses = buildUniqueStatuses();

export { combinedDevicesStatuses };
