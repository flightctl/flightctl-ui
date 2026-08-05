import type { Device, Fleet } from '@flightctl/types';
import type { CatalogItemArtifactType } from '@flightctl/types/alpha';

import type { VolumeCatalogSelection } from '../../../utils/catalog';

export const specificationsStepId = 'specifications';
export const selectTargetStepId = 'select-target';
export const appConfigStepId = 'app-config';
export const reviewStepId = 'review';

export type InstallSpecFormik = {
  version: string;
  channel: string;
};

export type TargetPickerFormik = {
  target: 'fleet' | 'device' | 'new-device' | undefined;
  fleet: Fleet | undefined;
  device: Device | undefined;
};

export type InstallOsFormik = InstallSpecFormik &
  TargetPickerFormik & {
    deploymentTarget: CatalogItemArtifactType | undefined;
    // Set after selecting the target, when the selection matches the current target spec
    isSpecUnchanged: boolean;
  };

export type DynamicFormConfigFormik = {
  appName: string;
  configureVia: 'editor' | 'form';
  editorContent: string;
  volumeSelection: VolumeCatalogSelection[];
  formValues: Record<string, unknown> | undefined;
  configSchema: Record<string, unknown> | undefined;
  /** Set by AppConfigStep when form view is used; used by wizard footer validation */
  dynamicFormValid: boolean;
};

export type InstallAppFormik = DynamicFormConfigFormik & InstallSpecFormik & TargetPickerFormik;
