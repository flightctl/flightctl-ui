/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A summary of the devices in the fleet returned when fetching a single Fleet.
 */
export type DevicesSummary = {
  /**
   * The total number of devices in the fleet.
   */
  total: number;
  /**
   * A breakdown of the devices in the fleet by "application" status.
   */
  applicationStatus: Record<string, number>;
  /**
   * A breakdown of the devices in the fleet by "summary" status.
   */
  summaryStatus: Record<string, number>;
  /**
   * A breakdown of the devices in the fleet by "updated" status.
   */
  updateStatus: Record<string, number>;
};

