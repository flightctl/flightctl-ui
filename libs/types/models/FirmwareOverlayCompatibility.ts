/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * FirmwareOverlayCompatibility names a firmware component and, optionally, the range of its versions that an overlay is compatible with.
 */
export type FirmwareOverlayCompatibility = {
  /**
   * Name of the firmware component.
   */
  component: string;
  /**
   * Exact compatible firmware version.
   */
  exact?: string;
  /**
   * Lowest compatible firmware version.
   */
  minimum?: string;
  /**
   * Highest compatible firmware version.
   */
  maximum?: string;
};

