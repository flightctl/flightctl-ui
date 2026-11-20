/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Duration } from './Duration';
export type OneTimeWindow = {
  /**
   * Exact calendar date on which the one-time window opens, for example 2026-11-15.
   */
  date: string;
  /**
   * Local time at which the one-time window opens on the specified date, relative to the schedule timeZone or the device local time zone when timeZone is omitted, for example 22:00.
   */
  at: string;
  startGraceDuration: Duration;
};

