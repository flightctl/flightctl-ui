/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request body for the newversion subresource endpoint.
 */
export type ImageBuildNewVersionRequest = {
  /**
   * Name for the new ImageBuild resource.
   */
  name: string;
  /**
   * Override for spec.source.imageTag. If omitted, the parent's tag is used.
   */
  sourceImageTag?: string;
  /**
   * Override for spec.destination.imageTag. If omitted, the parent's tag is used.
   */
  destinationImageTag?: string;
};

