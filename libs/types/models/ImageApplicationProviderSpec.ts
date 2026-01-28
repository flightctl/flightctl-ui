/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationPort } from './ApplicationPort';
import type { ApplicationResources } from './ApplicationResources';
import type { ApplicationVolumeProviderSpec } from './ApplicationVolumeProviderSpec';
export type ImageApplicationProviderSpec = (ApplicationVolumeProviderSpec & {
  /**
   * Reference to the OCI image or artifact for the application package.
   */
  image: string;
  /**
   * Kubernetes namespace for helm chart installation. Only applicable when appType is 'helm'.
   */
  namespace?: string;
  /**
   * Helm values to pass during install/upgrade. Supports arbitrarily nested YAML structures. Only applicable when appType is 'helm'.
   */
  values?: Record<string, any>;
  /**
   * List of values files from within the chart to use during install/upgrade. Files are relative to chart root and are applied in array order before user-provided values. Only applicable when appType is 'helm'.
   */
  valuesFiles?: Array<string>;
  /**
   * Port mappings.
   */
  ports?: Array<ApplicationPort>;
  resources?: ApplicationResources;
});

