/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceApplicationStatus } from './DeviceApplicationStatus';
import type { DeviceWorkloadSummaryStatus } from './DeviceWorkloadSummaryStatus';
export type DeviceWorkloadStatus = {
  /**
   * Summary status of a device workloads.
   */
  summary?: DeviceWorkloadSummaryStatus;
  /**
   * Status of device applications.
   */
  applications?: Array<DeviceApplicationStatus>;
};

