/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationDesiredState } from './ApplicationDesiredState';
import type { AppType } from './AppType';
/**
 * Common properties for all application types.
 */
export type ApplicationProviderBase = {
  /**
   * The application name must be 1–253 characters long, start with a letter or number, and contain no whitespace.
   */
  name?: string;
  appType: AppType;
  /**
   * Arbitrary metadata annotations. Used internally by the control plane (e.g., flightctl.io/workload-type) when transforming application types at render time.
   */
  readonly annotations?: Record<string, string>;
  /**
   * Desired lifecycle state for this application, as most recently set by the stop/start device APIs. Read-only: cannot be set directly by apply; only present in the rendered application spec delivered to the agent.
   */
  readonly desiredState?: ApplicationDesiredState;
  /**
   * Counter incremented by the restart device API each time the application is restarted. Read-only: cannot be set directly by apply; only present in the rendered application spec delivered to the agent.
   */
  readonly restartGeneration?: number;
};

