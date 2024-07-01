/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceSystemsSummaryType } from './DeviceSystemsSummaryType';
import type { DeviceSystemStatus } from './DeviceSystemStatus';
export type DeviceSystemsStatus = {
  /**
   * Summary status of device systems.
   */
  status?: DeviceSystemsSummaryType;
  /**
   * Status of device systems.
   */
  systems?: Array<DeviceSystemStatus>;
};

