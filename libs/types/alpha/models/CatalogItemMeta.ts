/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ObjectMeta } from '../../models/ObjectMeta';
/**
 * Metadata for CatalogItem resources. Extends ObjectMeta with catalog scoping.
 */
export type CatalogItemMeta = (ObjectMeta & {
  /**
   * The catalog this item belongs to. Similar to namespace in Kubernetes.
   */
  catalog: string;
});

