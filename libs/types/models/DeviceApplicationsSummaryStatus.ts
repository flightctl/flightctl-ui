/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationsSummaryStatusType } from './ApplicationsSummaryStatusType';
/**
 * A summary of the health of applications on the device.
 */
export type DeviceApplicationsSummaryStatus = {
  status: ApplicationsSummaryStatusType;
  /**
   * Human readable information detailing the last application transition.
   */
  info?: string;
};

