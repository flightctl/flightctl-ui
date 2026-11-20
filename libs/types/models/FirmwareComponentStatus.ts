/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FirmwareActualState } from './FirmwareActualState';
import type { FirmwareComponentState } from './FirmwareComponentState';
import type { FirmwareComponentType } from './FirmwareComponentType';
import type { FirmwareError } from './FirmwareError';
import type { FirmwareObservation } from './FirmwareObservation';
import type { FirmwareSelectedArtifact } from './FirmwareSelectedArtifact';
/**
 * FirmwareComponentStatus reports the selected and the observed state of one firmware component or overlay. Selected and observed values are reported separately, and an observed value that is not known is absent.
 */
export type FirmwareComponentStatus = {
  /**
   * Name of the firmware component or overlay.
   */
  name: string;
  type: FirmwareComponentType;
  /**
   * Whether the firmware specification manages the component.
   */
  managed: boolean;
  state: FirmwareComponentState;
  selected?: FirmwareSelectedArtifact;
  actual?: FirmwareActualState;
  observation?: FirmwareObservation;
  /**
   * Time at which the component was observed.
   */
  observedAt: string;
  /**
   * Boot ID of the device when the component was observed.
   */
  bootID: string;
  error?: FirmwareError;
};

