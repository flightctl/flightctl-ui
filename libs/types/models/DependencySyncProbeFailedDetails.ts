/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DependencySyncProbeFailedDetails = {
  /**
   * The type of detail for discriminator purposes.
   */
  detailType: 'DependencySyncProbeFailed';
  /**
   * The resource key identifying the dependency that failed (e.g. "git:my-repo/main").
   */
  resourceKey: string;
  /**
   * The error message from the failed probe.
   */
  error: string;
};

