import { ConditionStatus, ConditionType, Device } from '@flightctl/types';

export enum DeviceConditionStatus {
  Valid = ConditionType.DeviceValid,
  Available = ConditionType.DeviceAvailable,
  Progressing = ConditionType.DeviceProgressing,
  Approved = 'Approved', // Lack of a True condition
  Degraded = ConditionType.DeviceDegraded,
  Unavailable = 'Unavailable', // False condition for ConditionType.DeviceAvailable
}

// Sorted list of device statuses from "better" to "worse"
export const deviceStatusOrder: DeviceConditionStatus[] = [
  DeviceConditionStatus.Valid,
  DeviceConditionStatus.Available,
  DeviceConditionStatus.Progressing,
  DeviceConditionStatus.Approved,
  DeviceConditionStatus.Degraded,
  DeviceConditionStatus.Unavailable,
];

export const getDeviceStatus = (device: Device): DeviceConditionStatus => {
  const unavailableCondition = device.status?.conditions?.find(
    (c) => c.type === ConditionType.DeviceAvailable && c.status === ConditionStatus.ConditionStatusFalse,
  );
  if (unavailableCondition) {
    return DeviceConditionStatus.Unavailable;
  }
  const currentCondition = device.status?.conditions?.find((c) => c.status === ConditionStatus.ConditionStatusTrue);
  if (!currentCondition) {
    return DeviceConditionStatus.Approved;
  }
  return currentCondition.type as unknown as DeviceConditionStatus;
};
