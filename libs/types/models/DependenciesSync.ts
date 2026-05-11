/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Duration } from './Duration';
/**
 * Configuration for automated dependency synchronization.
 */
export type DependenciesSync = {
  /**
   * Whether automated dependency synchronization is enabled.
   */
  enabled?: boolean;
  pollInterval?: Duration;
};

