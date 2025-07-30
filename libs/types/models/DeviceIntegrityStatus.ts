/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceIntegrityCheckStatus } from './DeviceIntegrityCheckStatus';
import type { DeviceIntegrityStatusSummaryType } from './DeviceIntegrityStatusSummaryType';
/**
 * Summary status of the integrity of the device.
 */
export type DeviceIntegrityStatus = {
  deviceIdentity?: DeviceIntegrityCheckStatus;
  tpm?: DeviceIntegrityCheckStatus;
  status: DeviceIntegrityStatusSummaryType;
  /**
   * Human readable information about the last integrity transition.
   */
  info?: string;
  /**
   * Timestamp of the last integrity verification.
   */
  lastVerified?: string;
};

