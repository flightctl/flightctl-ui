/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * FirmwareRecoveryAction describes an operator action that recovers from a firmware failure.
 */
export type FirmwareRecoveryAction = {
  /**
   * Identifier of the recovery action.
   */
  code: string;
  /**
   * Description of the recovery action.
   */
  message: string;
  /**
   * Link to documentation for the recovery action.
   */
  documentationURL?: string;
  /**
   * Whether the recovery action requires physical access to the device.
   */
  requiresPhysicalAccess: boolean;
};

