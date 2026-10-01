/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A control-plane-generated delta hint for a nested image within an application. Present only in rendered application specs delivered to the agent.
 */
export type ImageDeltaHint = {
  /**
   * The target image reference this delta applies to.
   */
  targetImage: string;
  /**
   * The content digest of the target image.
   */
  targetDigest: string;
  /**
   * Reference to the delta artifact for this nested image.
   */
  deltaImage: string;
};

