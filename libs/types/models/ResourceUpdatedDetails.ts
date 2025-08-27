/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ResourceUpdatedDetails = {
  /**
   * The type of detail for discriminator purposes.
   */
  detailType: 'ResourceUpdated';
  /**
   * List of fields that were updated in the resource.
   */
  updatedFields: Array<'owner' | 'labels' | 'spec' | 'spec.selector' | 'spec.template'>;
  /**
   * The previous owner (if applicable).
   */
  previousOwner?: string | null;
  /**
   * The new owner (if applicable).
   */
  newOwner?: string | null;
};

