/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * An image reference and, when known, its content digest in local storage.
 */
export type ApplicationImageDigest = {
  /**
   * Image reference as it appears in the rendered application spec.
   */
  image: string;
  /**
   * Content digest of the image in local storage (e.g. sha256:abc...). Omitted when the local digest is unknown.
   */
  digest?: string;
};

