/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DeviceMultipleOwnersDetectedDetails = {
  /**
   * The type of detail for discriminator purposes.
   */
  detailType: 'DeviceMultipleOwnersDetected';
  /**
   * List of fleet names that match the device.
   */
  matchingFleets: Array<string>;
};

