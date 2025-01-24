import { DisruptionBudget } from '@flightctl/types';
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
  isAdvanced: boolean;
  updateTimeout: number;
  batches: BatchForm[];
};

export type DisruptionBudgetForm = DisruptionBudget & {
  isAdvanced: boolean;
};

export type FleetFormValues = DeviceSpecConfigFormValues & {
  name: string;
  fleetLabels: FlightCtlLabel[];
  labels: FlightCtlLabel[];
  rolloutPolicy: RolloutPolicyForm;
  disruptionBudget: DisruptionBudgetForm;
};
