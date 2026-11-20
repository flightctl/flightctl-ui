/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * FirmwareSupportedUpdater identifies an updater release that the agent can run.
 */
export type FirmwareSupportedUpdater = {
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
   * Digest of the configuration schema of the updater release.
   */
  schemaDigest: string;
  /**
   * Whether the updater release is already available on the device. An updater release that is not cached can still be fetched when it is needed.
   */
  cached?: boolean;
};

