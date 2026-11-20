/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FirmwareSelectedSource } from './FirmwareSelectedSource';
/**
 * FirmwareSelectedArtifact identifies the artifact selected for a firmware component or overlay.
 */
export type FirmwareSelectedArtifact = {
  source: FirmwareSelectedSource;
  /**
   * Firmware version of the selected artifact.
   */
  version?: string;
};

