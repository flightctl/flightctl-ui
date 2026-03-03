/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CatalogItemCategory } from './CatalogItemCategory';
import type { CatalogItemConfigurable } from './CatalogItemConfigurable';
import type { CatalogItemDeprecation } from './CatalogItemDeprecation';
import type { CatalogItemReference } from './CatalogItemReference';
import type { CatalogItemType } from './CatalogItemType';
import type { CatalogItemVersion } from './CatalogItemVersion';
import type { CatalogItemVisibility } from './CatalogItemVisibility';
/**
 * CatalogItemSpec defines the configuration for a catalog item.
 */
export type CatalogItemSpec = {
  category?: CatalogItemCategory;
  type: CatalogItemType;
  reference: CatalogItemReference;
  /**
   * Available versions using Cincinnati model. Use replaces for primary edge, skips when stable channel skips intermediate versions.
   */
  versions: Array<CatalogItemVersion>;
  defaults?: CatalogItemConfigurable;
  /**
   * Human-readable display name shown in catalog listings.
   */
  displayName?: string;
  /**
   * A brief one-line description of the catalog item.
   */
  shortDescription?: string;
  /**
   * URL or data URI of the catalog item icon for display in UI.
   */
  icon?: string;
  visibility?: CatalogItemVisibility;
  deprecation?: CatalogItemDeprecation;
  /**
   * Provider or publisher of the catalog item (company or team name).
   */
  provider?: string;
  /**
   * Link to support resources or documentation for getting help.
   */
  support?: string;
  /**
   * The homepage URL for the catalog item project.
   */
  homepage?: string;
  /**
   * Link to external documentation.
   */
  documentationUrl?: string;
};

