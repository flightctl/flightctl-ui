/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CatalogItemArtifactType } from './CatalogItemArtifactType';
/**
 * An artifact reference. The type field is the discriminator and must be unique within the artifacts list.
 */
export type CatalogItemArtifact = {
  type: CatalogItemArtifactType;
  /**
   * Optional human-readable display name for this artifact.
   */
  name?: string;
  /**
   * Artifact URI without version qualifier. The version reference (tag or digest) is applied at resolution time.
   */
  uri: string;
};

