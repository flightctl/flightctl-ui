/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * FirmwareActualState reports the firmware observed on the device. Values that cannot be observed are absent.
 */
export type FirmwareActualState = {
  /**
   * Observed firmware version.
   */
  version?: string;
  /**
   * Firmware version text as reported by the device firmware.
   */
  rawVersion?: string;
  /**
   * Whether an overlay has been verified active by its activation check.
   */
  active?: boolean;
};

