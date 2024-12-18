/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceSummaryStatusType } from './DeviceSummaryStatusType';
/**
 * A summary of the health of the device hardware and operating system resources.
 */
export type DeviceSummaryStatus = {
  status: DeviceSummaryStatusType;
  /**
   * Human readable information detailing the last device status transition.
   */
  info?: string;
};

