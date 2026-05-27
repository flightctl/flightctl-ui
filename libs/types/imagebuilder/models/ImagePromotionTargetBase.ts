/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Common fields shared by all ImagePromotionTarget variants.
 */
export type ImagePromotionTargetBase = {
  /**
   * Discriminator for the target type.
   */
  type: string;
  /**
   * Name of the parent Catalog resource.
   */
  catalogName: string;
  /**
   * Name of the CatalogItem to create or update.
   */
  catalogItemName: string;
  /**
   * Semver version string for the new CatalogItem version entry.
   */
  version: string;
};

