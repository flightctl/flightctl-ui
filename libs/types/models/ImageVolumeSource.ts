/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CatalogItemRefSpec } from './CatalogItemRefSpec';
import type { ImagePullPolicy } from './ImagePullPolicy';
/**
 * Describes the source of an OCI-compliant image or artifact. Exactly one of 'reference' or 'catalogItemRef' must be specified.
 */
export type ImageVolumeSource = {
  /**
   * Reference to an OCI-compliant image or artifact in a registry. This may be a container image or another type of OCI artifact, as long as it conforms to the OCI image specification.
   */
  reference?: string;
  catalogItemRef?: CatalogItemRefSpec;
  pullPolicy?: ImagePullPolicy;
};

