import { FlightCtlLabel } from '../../../types/extraTypes';
import { DeviceSpecConfigFormValues } from '../../Device/EditDeviceWizard/types';

export type FleetFormValues = DeviceSpecConfigFormValues & {
  name: string;
  fleetLabels: FlightCtlLabel[];
  labels: FlightCtlLabel[];
};
