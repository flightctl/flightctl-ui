/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * FirmwareObservationBackend carries updater-specific observation data and identifies the schema that defines it.
 */
export type FirmwareObservationBackend = {
  /**
   * Name of the updater that produced the observation.
   */
  updater: string;
  /**
   * Digest of the observation schema that defines data.
   */
  schemaDigest: string;
  /**
   * Updater-specific observation data. The observation schema identified by updater and schemaDigest defines every allowed field.
   */
  data: Record<string, any>;
};

