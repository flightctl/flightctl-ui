/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResourceAlertRule } from './ResourceAlertRule';
export type ResourceMonitorSpec = {
  monitorType: string;
  /**
   * Array of alert rules. Only one alert per severity is allowed.
   */
  alertRules: Array<ResourceAlertRule>;
  /**
   * Duration between monitor samples. Format: number followed by 's' for seconds, 'm' for minutes, 'h' for hours, 'd' for days.
   */
  samplingInterval?: string;
};

