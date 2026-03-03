/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CatalogItemVisibility } from './CatalogItemVisibility';
/**
 * CatalogSpec describes the configuration of a catalog. Catalogs are containers for locally-managed CatalogItems.
 */
export type CatalogSpec = {
  /**
   * Human-readable display name shown in catalog listings.
   */
  displayName?: string;
  /**
   * A brief one-line description of the catalog.
   */
  shortDescription?: string;
  /**
   * URL or data URI of the catalog icon for display in UI.
   */
  icon?: string;
  visibility?: CatalogItemVisibility;
  /**
   * Provider or publisher of the catalog (company or team name).
   */
  provider?: string;
  /**
   * Link to support resources or documentation for getting help.
   */
  support?: string;
};

