/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CatalogItemArtifactType } from './CatalogItemArtifactType';
/**
 * An alternative artifact format.
 */
export type CatalogItemArtifact = {
  type?: CatalogItemArtifactType;
  /**
   * Optional human-readable display name for this artifact.
   */
  name?: string;
  /**
   * Artifact URI (OCI reference, URL, S3 path, etc.).
   */
  uri: string;
};

