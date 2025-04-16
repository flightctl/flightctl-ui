/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ResourceUpdatedDetails = {
  /**
   * List of fields that were updated in the resource.
   */
  updatedFields: Array<'owner' | 'labels' | 'spec'>;
  /**
   * The previous owner (if applicable).
   */
  previousOwner?: string | null;
  /**
   * The new owner (if applicable).
   */
  newOwner?: string | null;
};

