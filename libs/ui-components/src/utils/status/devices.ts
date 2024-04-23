import { DeviceConditionStatus } from './device';
import { ApprovalStatus } from './enrollmentRequest';

type CombinedDevicesStatus = { key: string; label: DeviceConditionStatus | ApprovalStatus };

const buildUniqueStatuses = (): CombinedDevicesStatus[] => {
  const allUniqueStatuses: CombinedDevicesStatus[] = [];
  Object.keys(ApprovalStatus).forEach((approvalStatus) => {
    allUniqueStatuses.push({
      key: approvalStatus,
      label: ApprovalStatus[approvalStatus] as ApprovalStatus,
    });
  });
  Object.keys(DeviceConditionStatus).forEach((deviceStatus) => {
    // Approved is a shared status
    if ((deviceStatus as DeviceConditionStatus) !== DeviceConditionStatus.Approved) {
      allUniqueStatuses.push({
        key: deviceStatus,
        label: DeviceConditionStatus[deviceStatus] as DeviceConditionStatus,
      });
    }
  });
  allUniqueStatuses.sort((a, b) => a.label.localeCompare(b.label));
  return allUniqueStatuses;
};

const combinedDevicesStatuses = buildUniqueStatuses();

export { combinedDevicesStatuses };
