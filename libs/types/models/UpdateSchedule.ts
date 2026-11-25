/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CronExpression } from './CronExpression';
import type { Duration } from './Duration';
import type { OneTimeWindow } from './OneTimeWindow';
import type { TimeZone } from './TimeZone';
/**
 * Defines a schedule for an activity. A schedule may contain a complete recurring definition (at and startGraceDuration), one or more oneTimeWindows, or both. at and startGraceDuration must be provided together. The schedule-level timeZone applies to the recurring schedule and to all one-time windows in this object.
 */
export type UpdateSchedule = {
  timeZone?: TimeZone;
  /**
   * Cron expression format for the recurring schedule. See CronExpression for the supported syntax.
   */
  at?: CronExpression;
  /**
   * The maximum duration allowed for the recurring action to complete.
   */
  startGraceDuration?: Duration;
  /**
   * Date-specific windows in which the corresponding operation may start.
   */
  oneTimeWindows?: Array<OneTimeWindow>;
};

