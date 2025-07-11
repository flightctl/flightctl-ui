/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DeviceMultipleOwnersResolvedDetails = {
  /**
   * The type of detail for discriminator purposes.
   */
  detailType: 'DeviceMultipleOwnersResolved';
  /**
   * How the conflict was resolved.
   */
  resolutionType: DeviceMultipleOwnersResolvedDetails.resolutionType;
  /**
   * The fleet assigned as owner (null if no owner).
   */
  assignedOwner?: string | null;
  /**
   * List of fleets that previously matched the device.
   */
  previousMatchingFleets?: Array<string>;
};
export namespace DeviceMultipleOwnersResolvedDetails {
  /**
   * How the conflict was resolved.
   */
  export enum resolutionType {
    SINGLE_MATCH = 'SingleMatch',
    NO_MATCH = 'NoMatch',
    FLEET_DELETED = 'FleetDeleted',
  }
}

