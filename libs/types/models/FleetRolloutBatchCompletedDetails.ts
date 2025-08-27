/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FleetRolloutBatchCompletedDetails = {
  /**
   * The type of detail for discriminator purposes.
   */
  detailType: 'FleetRolloutBatchCompleted';
  /**
   * The name of the TemplateVersion that this batch is rolling out to.
   */
  templateVersion: string;
  /**
   * The batch within the fleet rollout.
   */
  batch: string;
  /**
   * The success percentage of the batch.
   */
  successPercentage: number;
  /**
   * The total number of devices in the batch.
   */
  total: number;
  /**
   * The number of successful devices in the batch.
   */
  successful: number;
  /**
   * The number of failed devices in the batch.
   */
  failed: number;
  /**
   * The number of timed out devices in the batch.
   */
  timedOut: number;
};

