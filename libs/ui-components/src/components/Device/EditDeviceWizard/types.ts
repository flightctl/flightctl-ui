import { ApplicationSpec } from '@flightctl/types';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { SpecConfigTemplate } from '../../../types/deviceSpec';

export type ApplicationFormSpec = Omit<ApplicationSpec, 'envVars'> & {
  variables: { name: string; value: string }[];
};

export type DeviceSpecConfigFormValues = {
  osImage?: string;
  configTemplates: SpecConfigTemplate[];
  applications: ApplicationFormSpec[];
};

export type EditDeviceFormValues = DeviceSpecConfigFormValues & {
  deviceAlias: string;
  labels: FlightCtlLabel[];
  fleetMatch: string;
};
