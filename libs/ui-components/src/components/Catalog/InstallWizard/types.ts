import { Device, Fleet } from '@flightctl/types';
import { AssetSelection } from '../../DynamicForm/DynamicForm';

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

export type InstallOsFormik = InstallSpecFormik & TargetPickerFormik;

export type DynamicFormConfigFormik = {
  appName: string;
  configureVia: 'editor' | 'form';
  editorContent: string;
  selectedAssets: AssetSelection[];
  formValues: Record<string, unknown> | undefined;
  configSchema: Record<string, unknown> | undefined;
  /** Set by AppConfigStep when form view is used; used by wizard footer validation */
  dynamicFormValid: boolean;
};

export type InstallAppFormik = DynamicFormConfigFormik & InstallSpecFormik & TargetPickerFormik;
