/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationContent } from './ApplicationContent';
import type { ImageDeltaHint } from './ImageDeltaHint';
export type InlineApplicationProviderSpec = {
  /**
   * A list of application content.
   */
  inline: Array<ApplicationContent>;
  /**
   * Optional hints for nested OCI images referenced by this inline application. Each entry identifies a target image reference and digest and names its delta artifact.
   */
  deltaImages?: Array<ImageDeltaHint>;
};

