import { ApplicationProviderSpec } from '@flightctl/types';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { SpecConfigTemplate } from '../../../types/deviceSpec';
import { SystemdUnitFormValue } from '../SystemdUnitsModal/TrackSystemdUnitsForm';

export type ApplicationFormSpec = Omit<ApplicationProviderSpec, 'envVars'> & {
  variables: { name: string; value: string }[];
};

export type DeviceSpecConfigFormValues = {
  osImage?: string;
  configTemplates: SpecConfigTemplate[];
  applications: ApplicationFormSpec[];
  systemdUnits: SystemdUnitFormValue[];
  registerMicroShift: boolean;
};

export type EditDeviceFormValues = DeviceSpecConfigFormValues & {
  deviceAlias: string;
  labels: FlightCtlLabel[];
  fleetMatch: string;
};
