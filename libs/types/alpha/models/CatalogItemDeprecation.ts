/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Deprecation information for a catalog item or version. Presence indicates deprecated status.
 */
export type CatalogItemDeprecation = {
  /**
   * Required message explaining why this is deprecated and what to do instead.
   */
  message: string;
  /**
   * Optional name of the replacement catalog item (item-level only).
   */
  replacement?: string;
};

