/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Result of an OCI registry check (tag existence or image accessibility).
 */
export type CheckRepositoryOciResult = {
  /**
   * Whether the image or tag is accessible in the registry.
   */
  accessible: boolean;
  /**
   * HTTP status code returned by the OCI registry when accessible is false. Absent when the failure is not an HTTP-level error (e.g. network timeout).
   */
  errorCode?: number;
  /**
   * Error message describing why the image or tag is not accessible.
   */
  errorMessage?: string;
};

