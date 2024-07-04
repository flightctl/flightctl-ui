/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResourceAlertSeverityType } from './ResourceAlertSeverityType';
export type ResourceAlertRule = {
  /**
   * Severity of the alert.
   */
  severity: ResourceAlertSeverityType;
  /**
   * Duration is the time over which the average usage is observed before alerting. Format: number followed by 's' for seconds, 'm' for minutes, 'h' for hours, 'd' for days.
   */
  duration: string;
  /**
   * The percentage of usage that triggers the alert.
   */
  percentage: number;
  /**
   * A human-readable description of the alert.
   */
  description: string;
};

