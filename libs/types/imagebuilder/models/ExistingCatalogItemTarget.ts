/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImagePromotionTargetBase } from './ImagePromotionTargetBase';
/**
 * Publish target that appends a version to an existing CatalogItem. Rejected immediately if the CatalogItem does not exist.
 */
export type ExistingCatalogItemTarget = (ImagePromotionTargetBase & {
  /**
   * Discriminator for the target type.
   */
  type?: ExistingCatalogItemTarget.type;
  /**
   * Name of the parent Catalog resource.
   */
  catalogName?: string;
  /**
   * Name of the CatalogItem to update.
   */
  catalogItemName?: string;
  /**
   * Semver version string for the new CatalogItem version entry.
   */
  version?: string;
  /**
   * Optional version-level readme for this version entry. Markdown is supported.
   */
  readme?: string;
  /**
   * The single version this one replaces, defining the primary upgrade edge.
   */
  replaces?: string;
  /**
   * Additional versions that can upgrade directly to this one.
   */
  skips?: Array<string>;
  /**
   * Semver range of versions that can upgrade directly to this one (e.g. ">=1.0.0 <1.3.0").
   */
  skipRange?: string;
});
export namespace ExistingCatalogItemTarget {
  /**
   * Discriminator for the target type.
   */
  export enum type {
    EXISTING_CATALOG_ITEM = 'ExistingCatalogItem',
  }
}

