/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FirmwareAttemptPhase } from './FirmwareAttemptPhase';
import type { FirmwareAttemptUpdater } from './FirmwareAttemptUpdater';
import type { FirmwareCancellationReason } from './FirmwareCancellationReason';
import type { FirmwareError } from './FirmwareError';
import type { FirmwareRecoveryAction } from './FirmwareRecoveryAction';
/**
 * FirmwareAttemptStatus reports the current or most recent firmware attempt. An attempt canceled because newer desired firmware superseded it keeps its own identity; a cancellation is neither a successful nor a failed activation.
 */
export type FirmwareAttemptStatus = {
  /**
   * Identifier of the attempt.
   */
  id: string;
  /**
   * Rendered device version that the attempt applies.
   */
  renderedVersion: string;
  /**
   * Hash of the firmware specification that the attempt applies.
   */
  specHash: string;
  /**
   * Retry generation that the attempt consumed.
   */
  retryGeneration: number;
  updater?: FirmwareAttemptUpdater;
  phase: FirmwareAttemptPhase;
  /**
   * Time at which the attempt started.
   */
  startedAt: string;
  /**
   * Time at which the attempt status last changed.
   */
  updatedAt: string;
  /**
   * Whether the attempt has changed firmware or boot configuration on the device.
   */
  changed: boolean;
  error?: FirmwareError;
  cancellationReason?: FirmwareCancellationReason;
  /**
   * Recovery actions available to the operator.
   */
  recovery: Array<FirmwareRecoveryAction>;
};

