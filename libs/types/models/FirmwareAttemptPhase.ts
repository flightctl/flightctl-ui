/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Phase of a firmware attempt. Succeeded, Failed and Canceled are terminal phases.
 */
export enum FirmwareAttemptPhase {
  FirmwareAttemptPhasePreparing = 'Preparing',
  FirmwareAttemptPhaseWaitingForPolicy = 'WaitingForPolicy',
  FirmwareAttemptPhaseStaging = 'Staging',
  FirmwareAttemptPhaseAwaitingReboot = 'AwaitingReboot',
  FirmwareAttemptPhaseVerifying = 'Verifying',
  FirmwareAttemptPhaseSucceeded = 'Succeeded',
  FirmwareAttemptPhaseFailed = 'Failed',
  FirmwareAttemptPhaseCanceled = 'Canceled',
}
