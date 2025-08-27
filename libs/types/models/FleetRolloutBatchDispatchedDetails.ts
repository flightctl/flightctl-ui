/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FleetRolloutBatchDispatchedDetails = {
  /**
   * The type of detail for discriminator purposes.
   */
  detailType: 'FleetRolloutBatchDispatched';
  /**
   * The name of the TemplateVersion that this batch is rolling out to.
   */
  templateVersion: string;
  /**
   * The batch within the fleet rollout.
   */
  batch: string;
};

