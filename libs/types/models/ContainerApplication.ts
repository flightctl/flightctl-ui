/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationEnvVars } from './ApplicationEnvVars';
import type { ApplicationPort } from './ApplicationPort';
import type { ApplicationProviderBase } from './ApplicationProviderBase';
import type { ApplicationResources } from './ApplicationResources';
import type { ApplicationUser } from './ApplicationUser';
import type { ApplicationVolumeProviderSpec } from './ApplicationVolumeProviderSpec';
import type { CatalogItemRefApplicationProviderSpec } from './CatalogItemRefApplicationProviderSpec';
import type { ImageApplicationProviderSpec } from './ImageApplicationProviderSpec';
export type ContainerApplication = (ApplicationProviderBase & ApplicationEnvVars & ApplicationUser & ApplicationVolumeProviderSpec & (ImageApplicationProviderSpec | CatalogItemRefApplicationProviderSpec) & {
  /**
   * Port mappings.
   */
  ports?: Array<ApplicationPort>;
  resources?: ApplicationResources;
});

