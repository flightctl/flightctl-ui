/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FleetRolloutStartedDetails = {
  /**
   * The type of detail for discriminator purposes.
   */
  detailType: 'FleetRolloutStarted';
  /**
   * The name of the TemplateVersion that is rolling out.
   */
  templateVersion: string;
  /**
   * Rollout strategy type.
   */
  isImmediate: FleetRolloutStartedDetails.isImmediate;
};
export namespace FleetRolloutStartedDetails {
  /**
   * Rollout strategy type.
   */
  export enum isImmediate {
    BATCHED = 'batched',
    IMMEDIATE = 'immediate',
  }
}

