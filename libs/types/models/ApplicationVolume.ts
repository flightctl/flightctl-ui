/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageMountVolumeProviderSpec } from './ImageMountVolumeProviderSpec';
import type { ImageVolumeProviderSpec } from './ImageVolumeProviderSpec';
import type { MountVolumeProviderSpec } from './MountVolumeProviderSpec';
export type ApplicationVolume = ({
  /**
   * Unique name of the volume used within the application.
   */
  name: string;
} & (ImageVolumeProviderSpec | MountVolumeProviderSpec | ImageMountVolumeProviderSpec));

