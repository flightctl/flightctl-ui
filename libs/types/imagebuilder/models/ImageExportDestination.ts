/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * ImageExportDestination specifies the destination for the exported images.
 */
export type ImageExportDestination = {
  /**
   * The name of the Repository resource to push the exported images to.
   */
  repository: string;
  /**
   * The name of the destination image.
   */
  imageName: string;
  /**
   * The base tag for the destination images.
   */
  tag: string;
};

