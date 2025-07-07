/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DeviceOwnershipChangedDetails = {
  /**
   * The type of detail for discriminator purposes.
   */
  detailType: 'DeviceOwnershipChanged';
  /**
   * The previous owner fleet (null if none).
   */
  previousOwner?: string | null;
  /**
   * The new owner fleet (null if removed).
   */
  newOwner?: string | null;
};

