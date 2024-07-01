/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationsSummaryStatus } from './ApplicationsSummaryStatus';
import type { ApplicationStatus } from './ApplicationStatus';
export type DeviceApplicationsStatus = {
  /**
   * Map of system application statuses.
   */
  data: Record<string, ApplicationStatus>;
  /**
   * Summary status of system applications.
   */
  summary: ApplicationsSummaryStatus;
};

