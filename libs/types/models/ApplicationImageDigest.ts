/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * An image reference and its content digest in local storage.
 */
export type ApplicationImageDigest = {
  /**
   * Image reference as it appears in the rendered application spec.
   */
  image: string;
  /**
   * Content digest of the image in local storage (e.g. sha256:abc...).
   */
  digest: string;
};

