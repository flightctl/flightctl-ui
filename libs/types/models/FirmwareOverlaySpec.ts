/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FirmwareOverlayCompatibility } from './FirmwareOverlayCompatibility';
/**
 * FirmwareOverlaySpec declares a required device tree overlay and the firmware it is compatible with. The updater configuration defines the overlay's artifact source, format and signature.
 */
export type FirmwareOverlaySpec = {
  /**
   * Name of the overlay. It must be unique across the components and overlays of the firmware specification.
   */
  name: string;
  /**
   * Firmware components, and optionally their version ranges, that the overlay is compatible with.
   */
  compatibleFirmware: Array<FirmwareOverlayCompatibility>;
};

