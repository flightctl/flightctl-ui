/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FileOperation } from './FileOperation';
export type HookActionSpec = {
  on?: Array<FileOperation>;
  /**
   * The maximum duration allowed for the action to complete.
   * The duration should be specified as a positive integer
   * followed by a time unit. Supported time units are:
   * - 's' for seconds
   * - 'm' for minutes
   * - 'h' for hours
   * - 'd' for days
   *
   */
  timeout?: string;
};

