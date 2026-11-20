/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * FirmwareSelectedSource identifies where a selected artifact comes from and its immutable digest, without credentials or signed URL parameters.
 */
export type FirmwareSelectedSource = {
  /**
   * Kind of the artifact source, for example http.
   */
  kind: string;
  /**
   * Sanitized identity of the artifact source.
   */
  identity: string;
  /**
   * Digest of the selected artifact.
   */
  digest: string;
};

