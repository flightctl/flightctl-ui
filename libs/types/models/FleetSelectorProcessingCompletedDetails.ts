/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FleetSelectorProcessingCompletedDetails = {
  /**
   * The type of detail for discriminator purposes.
   */
  detailType: 'FleetSelectorProcessingCompleted';
  /**
   * The type of processing that was completed.
   */
  processingType: FleetSelectorProcessingCompletedDetails.processingType;
  /**
   * Number of devices processed.
   */
  devicesProcessed: number;
  /**
   * Number of devices that had processing errors.
   */
  devicesWithErrors?: number;
  /**
   * Duration of the processing operation.
   */
  processingDuration?: string;
};
export namespace FleetSelectorProcessingCompletedDetails {
  /**
   * The type of processing that was completed.
   */
  export enum processingType {
    SELECTOR_UPDATED = 'SelectorUpdated',
    FLEET_DELETED = 'FleetDeleted',
    DEVICE_LABELS_UPDATED = 'DeviceLabelsUpdated',
  }
}

