/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * FirmwareVersionConstraints expresses version intent using the firmware's own version semantics rather than semantic versioning. Set at least one of exact, minimum or maximum, or set latest to true. All set constraints apply together. Versions are compared by the updater on the device, not by the service.
 */
export type FirmwareVersionConstraints = {
  /**
   * Exact firmware version to select.
   */
  exact?: string;
  /**
   * Lowest acceptable firmware version.
   */
  minimum?: string;
  /**
   * Highest acceptable firmware version.
   */
  maximum?: string;
  /**
   * Whether to select the newest compatible version that satisfies the other constraints.
   */
  latest?: boolean;
};

