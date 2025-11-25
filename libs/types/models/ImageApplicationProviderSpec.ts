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
   * Port mappings.
   */
  ports?: Array<ApplicationPort>;
  resources?: ApplicationResources;
});

