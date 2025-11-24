/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageVolumeSource } from './ImageVolumeSource';
import type { VolumeMount } from './VolumeMount';
/**
 * Volume from OCI image mounted at specified path.
 */
export type ImageMountVolumeProviderSpec = {
  image: ImageVolumeSource;
  mount: VolumeMount;
};

