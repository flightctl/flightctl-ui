/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request to check if a specific OCI image is accessible in a registry.
 */
export type CheckRepositoryOciImageRequest = {
  /**
   * The image name/path within the registry (e.g. "centos-bootc/centos-bootc"). Combined with the registry host from the Repository resource, this forms the full image reference (e.g. "quay.io/centos-bootc/centos-bootc").
   */
  imageName: string;
};

