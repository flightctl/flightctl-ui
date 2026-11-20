/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Duration } from './Duration';
import type { TimeZone } from './TimeZone';
export type OneTimeWindow = {
  /**
   * Exact calendar date on which the one-time window opens, for example 2026-11-15.
   */
  date: string;
  /**
   * Local time at which the one-time window opens on the specified date, relative to this window's timeZone or, when omitted, the schedule timeZone or device local time zone, for example 22:00.
   */
  at: string;
  startGraceDuration: Duration;
  /**
   * Time zone used for this window. When omitted, the schedule timeZone is used, or device local time if that is also omitted.
   */
  timeZone?: TimeZone;
};

