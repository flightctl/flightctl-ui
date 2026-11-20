/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * FirmwareAttemptUpdater identifies the updater release pinned for an attempt. It is absent when the attempt was rejected before an updater release was selected.
 */
export type FirmwareAttemptUpdater = {
  /**
   * Name of the updater.
   */
  name: string;
  /**
   * Version of the updater release.
   */
  version: string;
  /**
   * Digest of the immutable delivery image of the updater release.
   */
  buildDigest: string;
  /**
   * Version of the firmware workflow protocol that the updater release implements.
   */
  protocol: number;
  /**
   * Digest of the configuration schema that the attempt was validated against.
   */
  schemaDigest: string;
  /**
   * Digest of the updater configuration that the attempt applies.
   */
  configDigest: string;
  /**
   * Digest of the verified extraction manifest of the updater package. It is required before the updater changes the device.
   */
  manifestDigest?: string;
};

