/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FirmwareAttemptStatus } from './FirmwareAttemptStatus';
import type { FirmwareComponentStatus } from './FirmwareComponentStatus';
import type { FirmwareSupportStatus } from './FirmwareSupportStatus';
/**
 * FirmwareStatus reports firmware support on the device, the current or most recent firmware attempt and the observed state of each firmware component and overlay.
 */
export type FirmwareStatus = {
  support: FirmwareSupportStatus;
  attempt?: FirmwareAttemptStatus;
  /**
   * Observed state of each firmware component and overlay.
   */
  components: Array<FirmwareComponentStatus>;
  /**
   * Time at which the firmware status was observed.
   */
  observedAt: string;
  /**
   * Boot ID of the device when the firmware status was observed.
   */
  bootID: string;
};

