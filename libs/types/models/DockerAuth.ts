/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Docker-style authentication for OCI registries.
 */
export type DockerAuth = {
  authType: 'docker';
  /**
   * The username for registry authentication.
   */
  username: string;
  /**
   * The password or token for registry authentication.
   */
  password: string;
};

