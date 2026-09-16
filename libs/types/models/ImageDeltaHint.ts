/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A delta hint for a nested image within an application.
 */
export type ImageDeltaHint = {
  /**
   * The content digest of the target image.
   */
  targetDigest: string;
  /**
   * Reference to the delta artifact for this nested image.
   */
  deltaImage: string;
};

