/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CatalogItemRefSpec } from './CatalogItemRefSpec';
/**
 * Either a specific OCI image reference, or a reference to a catalog item version that can be resolved to an OCI image ref.
 */
export type ImageOrCatalogItemRefSpec = ({
  /**
   * Reference to an OCI image or artifact with tag.
   */
  image?: string;
} & {
  catalogItemRef?: CatalogItemRefSpec;
});

