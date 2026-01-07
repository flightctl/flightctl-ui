/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * ImageBuildSource specifies the source image for the build.
 */
export type ImageBuildSource = {
  /**
   * The name of the Repository resource of type OCI containing the source image.
   */
  repository: string;
  /**
   * The name of the source image.
   */
  imageName: string;
  /**
   * The tag of the source image.
   */
  imageTag: string;
};

