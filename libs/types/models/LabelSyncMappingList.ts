/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiVersion } from './ApiVersion';
import type { LabelSyncMapping } from './LabelSyncMapping';
import type { ListMeta } from './ListMeta';
/**
 * LabelSyncMappingList is a list of LabelSyncMapping resources.
 */
export type LabelSyncMappingList = {
  apiVersion: ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents.
   */
  kind: string;
  metadata: ListMeta;
  /**
   * List of LabelSyncMapping resources.
   */
  items: Array<LabelSyncMapping>;
};

