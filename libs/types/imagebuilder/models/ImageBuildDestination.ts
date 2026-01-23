/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * ImageBuildDestination specifies the destination for the built image.
 */
export type ImageBuildDestination = {
  /**
   * The name of the Repository resource of type OCI to push the built image to.
   */
  repository: string;
  /**
   * The name of the output image.
   */
  imageName: string;
  /**
   * The tag of the output image.
   */
  imageTag: string;
};

