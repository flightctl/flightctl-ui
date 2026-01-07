/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * ImageReferenceSource specifies a source image from a repository.
 */
export type ImageReferenceSource = {
  /**
   * The type of source.
   */
  type: 'imageReference';
  /**
   * The name of the Repository resource containing the source image.
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

