/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FirmwareComponentSpec } from './FirmwareComponentSpec';
import type { FirmwareOverlaySpec } from './FirmwareOverlaySpec';
import type { FirmwareUpdaterSpec } from './FirmwareUpdaterSpec';
/**
 * FirmwareSpec declares the desired firmware of a device: the approved updater release that applies it, the qualified firmware profile, the version intent of each managed firmware component and the device tree overlays that must be active. When firmware is absent, the device firmware is unmanaged and its installed firmware is left unchanged.
 */
export type FirmwareSpec = {
  /**
   * Counter that requests a new firmware attempt with unchanged versions and artifacts. Increase it only after the cause of a failed attempt has been resolved. It is not a command to force flashing.
   */
  retryGeneration?: number;
  /**
   * Name of the qualified firmware profile for the device hardware. In a fleet template the value may use template parameters.
   */
  profile: string;
  updater: FirmwareUpdaterSpec;
  /**
   * Firmware components to manage, each with its version intent. Component and overlay names must be unique across the firmware specification. Removing a component stops managing it without restoring earlier firmware.
   */
  components: Array<FirmwareComponentSpec>;
  /**
   * Device tree overlays that must be active. Every listed overlay is required. An empty list requests the removal of previously managed overlays.
   */
  overlays: Array<FirmwareOverlaySpec>;
};

