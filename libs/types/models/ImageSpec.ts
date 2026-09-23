/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageDeltaHint } from './ImageDeltaHint';
/**
 * Reference to an OCI image or artifact with tag.
 */
export type ImageSpec = {
  /**
   * Reference to an OCI image or artifact with tag.
   */
  image: string;
  /**
   * Optional hint: a reference to a delta artifact for the main image. Set by the control plane when a successful delta generation record exists for the current-to-target digest transition.
   */
  deltaImage?: string;
  /**
   * Optional hints for nested images within this application (e.g. service images in a compose app, OCI volume images). Each entry maps a target digest to its delta artifact reference.
   */
  deltaImages?: Array<ImageDeltaHint>;
};

