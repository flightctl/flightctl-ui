/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * An image reference and its known registry image digest.
 */
export type ApplicationImageDigest = {
  /**
   * Image reference as it appears in the rendered application spec.
   */
  image: string;
  /**
   * Registry digest associated with this image. If the runtime identifies a platform-specific image, this may differ from the digest in the image reference. Omitted when unavailable.
   */
  digest?: string;
};

