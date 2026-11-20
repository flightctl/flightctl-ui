/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FirmwareAttemptPhase } from './FirmwareAttemptPhase';
import type { FirmwareBudgetKey } from './FirmwareBudgetKey';
/**
 * FirmwareError describes a firmware failure.
 */
export type FirmwareError = {
  /**
   * Machine-readable reason for the failure. ResourceLimitExceeded is the reason for every failure caused by exceeding a resource budget of the updater release, and such an error must name the budget in exceededBudget.
   */
  reason: string;
  /**
   * Human-readable description of the failure.
   */
  message: string;
  /**
   * Whether the agent retries preparation automatically. It does not permit retrying activation.
   */
  retryable: boolean;
  /**
   * Name of the affected firmware component or overlay, when known.
   */
  component?: string;
  phase?: FirmwareAttemptPhase;
  exceededBudget?: FirmwareBudgetKey;
};

