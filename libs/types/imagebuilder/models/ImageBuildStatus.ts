/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageBuildCondition } from './ImageBuildCondition';
/**
 * ImageBuildStatus represents the current status of an ImageBuild.
 */
export type ImageBuildStatus = {
  /**
   * Current conditions of the ImageBuild.
   */
  conditions?: Array<ImageBuildCondition>;
  /**
   * The full image reference of the built image (e.g., quay.io/org/imagename:tag).
   */
  imageReference?: string;
  /**
   * The architecture of the built image.
   */
  architecture?: string;
  /**
   * The digest of the built image manifest.
   */
  manifestDigest?: string;
  /**
   * The last time the build was seen (heartbeat).
   */
  lastSeen?: string;
};

