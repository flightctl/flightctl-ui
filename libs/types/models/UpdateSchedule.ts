/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CronExpression } from './CronExpression';
import type { Duration } from './Duration';
import type { TimeZone } from './TimeZone';
/**
 * Defines the schedule for automatic updates, including timing and optional timeout.
 */
export type UpdateSchedule = {
  timeZone?: TimeZone;
  at: CronExpression;
  startGraceDuration?: Duration;
};

