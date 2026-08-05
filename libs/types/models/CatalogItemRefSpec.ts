/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A reference to a catalog item, along with its configuration.
 */
export type CatalogItemRefSpec = {
  /**
   * The catalog name that the item is part of.
   */
  catalog: string;
  /**
   * The name of the catalog item itself.
   */
  item: string;
  /**
   * A valid version that currently exists in the catalog item.
   */
  version: string;
  /**
   * An optional update channel which will be used to provide update cues when available.
   */
  channel?: string;
};

