/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceUpdatedStatusType } from './DeviceUpdatedStatusType';
import type { DeviceUpdatedStageType } from './DeviceUpdatedStageType';
/**
 * Current status of the device update.
 */
export type DeviceUpdatedStatus = {
  status: DeviceUpdatedStatusType;
  stage?: DeviceUpdatedStageType;
  /**
   * Human readable information about the last device update transition.
   */
  info?: string;
};
