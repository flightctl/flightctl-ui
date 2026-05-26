/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DependencyChangeDetectedDetails = {
  /**
   * The type of detail for discriminator purposes.
   */
  detailType: 'DependencyChangeDetected';
  /**
   * The resource key identifying the dependency that changed (e.g. "git:my-repo/main").
   */
  resourceKey: string;
  /**
   * The new fingerprint (e.g. commit SHA) of the changed dependency.
   */
  fingerprint: string;
};

