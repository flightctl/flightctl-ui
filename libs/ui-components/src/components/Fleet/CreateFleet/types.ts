import { FlightCtlLabel } from '../../../types/extraTypes';
import { DeviceSpecConfigFormValues } from '../../Device/EditDeviceWizard/types';

export enum BatchLimitType {
  BatchLimitPercent = 'percent',
  BatchLimitAbsoluteNumber = 'value',
}

export type BatchForm = {
  selector: FlightCtlLabel[];
  limit?: number;
  limitType: BatchLimitType;
  successThreshold?: number;
};

export type RolloutPolicyForm = {
  isActive: boolean;
  updateTimeout: number;
  batches: BatchForm[];
};

export type FleetFormValues = DeviceSpecConfigFormValues & {
  name: string;
  fleetLabels: FlightCtlLabel[];
  labels: FlightCtlLabel[];
  rolloutPolicy: RolloutPolicyForm;
};
