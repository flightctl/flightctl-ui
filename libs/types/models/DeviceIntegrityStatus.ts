/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceIntegrityStatusSummaryType } from './DeviceIntegrityStatusSummaryType';
/**
 * Summary status of the integrity of the device.
 */
export type DeviceIntegrityStatus = {
  status: DeviceIntegrityStatusSummaryType;
  /**
   * Human readable information about the last integrity transition.
   */
  info?: string;
};

