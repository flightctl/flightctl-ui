/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceResourceStatusType } from './DeviceResourceStatusType';
/**
 * Current status of the resources of the device.
 */
export type DeviceResourceStatus = {
  /**
   * Status of the device CPU resources.
   */
  cpu: DeviceResourceStatusType;
  /**
   * Status of the device memory resources.
   */
  memory: DeviceResourceStatusType;
  /**
   * Status of the device disk resources.
   */
  disk: DeviceResourceStatusType;
};

