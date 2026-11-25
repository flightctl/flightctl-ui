/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FirmwareSupportedUpdater } from './FirmwareSupportedUpdater';
/**
 * FirmwareSupportStatus reports whether the agent can manage firmware on the device and which updater releases it can run. Agents that support firmware report it even when no firmware is managed.
 */
export type FirmwareSupportStatus = {
  /**
   * Version of the firmware support contract that the agent reports.
   */
  apiVersion: number;
  /**
   * Whether firmware management is supported on the device.
   */
  supported: boolean;
  /**
   * Firmware profile detected for the device hardware, when known.
   */
  profile?: string;
  /**
   * Revision of the detected firmware profile, when known.
   */
  profileRevision?: string;
  /**
   * Reason firmware management is or is not supported.
   */
  reason?: string;
  /**
   * Updater releases that the agent can run.
   */
  updaters: Array<FirmwareSupportedUpdater>;
};

