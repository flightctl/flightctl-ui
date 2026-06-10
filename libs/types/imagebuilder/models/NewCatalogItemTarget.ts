/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImagePromotionTargetBase } from './ImagePromotionTargetBase';
/**
 * Publish target that creates a new CatalogItem. Rejected immediately if a CatalogItem with the given catalogItemName already exists.
 */
export type NewCatalogItemTarget = (ImagePromotionTargetBase & {
  /**
   * Discriminator for the target type.
   */
  type?: NewCatalogItemTarget.type;
  /**
   * Name of the parent Catalog resource.
   */
  catalogName?: string;
  /**
   * Name of the CatalogItem to create.
   */
  catalogItemName?: string;
  /**
   * Semver version string for the new CatalogItem version entry.
   */
  version?: string;
  /**
   * Optional item-level readme for the new CatalogItem. Markdown is supported.
   */
  readme?: string;
  /**
   * Optional human-readable display name for the new CatalogItem.
   */
  displayName?: string;
});
export namespace NewCatalogItemTarget {
  /**
   * Discriminator for the target type.
   */
  export enum type {
    NEW_CATALOG_ITEM = 'NewCatalogItem',
  }
}

