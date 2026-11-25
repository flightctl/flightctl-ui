/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FirmwareVersionConstraints } from './FirmwareVersionConstraints';
/**
 * FirmwareComponentSpec declares the version intent for one firmware component.
 */
export type FirmwareComponentSpec = {
  /**
   * Name of the firmware component, a lowercase RFC 1123 label. It must be unique across the components and overlays of the firmware specification.
   */
  name: string;
  version: FirmwareVersionConstraints;
  /**
   * SHA-256 digest of the artifact to select when several artifacts provide the requested version.
   */
  artifactDigest?: string;
};

