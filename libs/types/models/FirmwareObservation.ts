/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FirmwareObservationBackend } from './FirmwareObservationBackend';
/**
 * FirmwareObservation carries evidence about a firmware component or overlay observed on the device.
 */
export type FirmwareObservation = {
  /**
   * Identity of the component that produced the observation, when known.
   */
  producerIdentity?: string;
  backend?: FirmwareObservationBackend;
};

