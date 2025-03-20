import { FlightCtlLabel } from '../../../types/extraTypes';
import { AppForm, SpecConfigTemplate } from '../../../types/deviceSpec';
import { SystemdUnitFormValue } from '../SystemdUnitsModal/TrackSystemdUnitsForm';

export type DeviceSpecConfigFormValues = {
  osImage?: string;
  configTemplates: SpecConfigTemplate[];
  applications: AppForm[];
  systemdUnits: SystemdUnitFormValue[];
  registerMicroShift: boolean;
};

export type EditDeviceFormValues = DeviceSpecConfigFormValues & {
  deviceAlias: string;
  labels: FlightCtlLabel[];
  fleetMatch: string;
};
