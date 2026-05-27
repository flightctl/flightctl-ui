/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request to check if a specific image tag exists in an OCI registry.
 */
export type CheckRepositoryOciTagRequest = {
  /**
   * The image name/path within the registry (e.g. "centos-bootc/centos-bootc"). Combined with the registry host from the Repository resource, this forms the full repository reference (e.g. "quay.io/centos-bootc/centos-bootc").
   */
  imageName: string;
  /**
   * The image tag to check for existence (e.g. "9.5").
   */
  tag: string;
};

