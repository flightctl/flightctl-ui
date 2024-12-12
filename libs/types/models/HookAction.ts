/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HookActionRun } from './HookActionRun';
import type { HookCondition } from './HookCondition';
export type HookAction = ({
  /**
   * Conditions that must be met for the action to be executed.
   */
  if?: Array<HookCondition>;
  /**
   * The maximum duration allowed for the action to complete.
   * The duration should be specified as a positive integer
   * followed by a time unit. Supported time units are:
   * - 's' for seconds
   * - 'm' for minutes
   * - 'h' for hours
   *
   */
  timeout?: string;
} & HookActionRun);

