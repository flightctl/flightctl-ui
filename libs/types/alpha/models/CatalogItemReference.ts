/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CatalogItemArtifact } from './CatalogItemArtifact';
/**
 * Reference to the primary artifact and optional alternative formats.
 */
export type CatalogItemReference = {
  /**
   * Primary artifact URI without version tag. Supports OCI references, URLs, S3 paths, etc.
   */
  uri: string;
  /**
   * Alternative artifact formats (e.g., qcow2, ISO for bootc images).
   */
  artifacts?: Array<CatalogItemArtifact>;
};

