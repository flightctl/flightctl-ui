/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationVolumeReclaimPolicy } from './ApplicationVolumeReclaimPolicy';
import type { ImageMountVolumeProviderSpec } from './ImageMountVolumeProviderSpec';
import type { ImageVolumeProviderSpec } from './ImageVolumeProviderSpec';
import type { MountVolumeProviderSpec } from './MountVolumeProviderSpec';
export type ApplicationVolume = ({
  /**
   * Unique name of the volume used within the application.
   */
  name: string;
  reclaimPolicy?: ApplicationVolumeReclaimPolicy;
} & (ImageVolumeProviderSpec | MountVolumeProviderSpec | ImageMountVolumeProviderSpec));

