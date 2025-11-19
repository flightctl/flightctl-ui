/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Resource limits for the application.
 */
export type ApplicationResourceLimits = {
  /**
   * CPU limit in cores (e.g., "1", "0.75").
   */
  cpu?: string;
  /**
   * Memory limit with unit (e.g., "256m", "2g") using Podman format (b=bytes, k=kibibytes, m=mebibytes, g=gibibytes).
   */
  memory?: string;
};

