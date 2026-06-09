/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * DependencySyncConfigRefStatus represents the rendered fingerprint for a single config provider's external dependency.
 */
export type DependencySyncConfigRefStatus = {
  /**
   * The name of the config provider (e.g. the git or HTTP config source name).
   */
  configProviderName: string;
  /**
   * The fingerprint of the rendered content (e.g. git commit SHA, sha256 of HTTP body, K8s secret ResourceVersion).
   */
  fingerprint?: string;
  /**
   * The last time the fingerprint changed (i.e. the dependency content was updated).
   */
  lastUpdatedAt?: string;
};

