/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiVersion } from './ApiVersion';
import type { CatalogItemMeta } from './CatalogItemMeta';
import type { CatalogItemSpec } from './CatalogItemSpec';
/**
 * CatalogItem represents an application template from a catalog. It provides default configuration values that can be customized when adding the application to a fleet.
 */
export type CatalogItem = {
  apiVersion: ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents.
   */
  kind: string;
  metadata: CatalogItemMeta;
  spec: CatalogItemSpec;
};

