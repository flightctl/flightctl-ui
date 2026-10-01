/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceDeltaApplyStatus } from './DeviceDeltaApplyStatus';
/**
 * Current status of the device OS.
 */
export type DeviceOsStatus = {
  /**
   * Version of the OS image.
   */
  image: string;
  /**
   * The digest of the OS image (e.g. sha256:a0...).
   */
  imageDigest: string;
  /**
   * Size of the control-plane generated OS delta image in IEC units (e.g. "245.3 MiB", "1 GiB"). Absent when no delta image was generated or its size is unknown.
   */
  deltaSize?: string;
  lastDelta?: DeviceDeltaApplyStatus;
};

