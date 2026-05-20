/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A curated base image entry available in an OCI registry.
 */
export type BaseImageEntry = {
  /**
   * Human-readable label shown in the UI (e.g., "CentOS").
   */
  displayName?: string;
  /**
   * Image path within the registry (e.g., "centos-bootc/centos-bootc").
   */
  imageName: string;
  /**
   * Selectable tags for this image (e.g., ["stream9", "stream10"]).
   */
  tags: Array<string>;
};

