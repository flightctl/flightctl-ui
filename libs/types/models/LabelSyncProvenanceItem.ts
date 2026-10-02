/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Current owning LabelSyncMapping names for one exact label key.
 */
export type LabelSyncProvenanceItem = {
  /**
   * Exact label key.
   */
  key: string;
  /**
   * Names of current owning LabelSyncMapping resources. An empty array means the key has no current mapping owner.
   */
  owners: Array<string>;
};

