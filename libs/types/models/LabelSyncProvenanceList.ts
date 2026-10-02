/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LabelSyncProvenanceItem } from './LabelSyncProvenanceItem';
/**
 * Current LabelSyncMapping ownership grouped by exact label key.
 */
export type LabelSyncProvenanceList = {
  /**
   * For organization queries, one item per supplied key in request order, including duplicates. For Device queries, one item per currently owned key, sorted by key.
   */
  items: Array<LabelSyncProvenanceItem>;
};

