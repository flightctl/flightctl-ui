/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Structured details for PrepareDeltas events.
 */
export type PrepareDeltasDetails = {
  /**
   * The type of detail for discriminator purposes.
   */
  detailType: 'PrepareDeltas';
  /**
   * Fleet only. The TemplateVersion this prepare is for. Required when involvedObject.kind is Fleet; omitted for Device.
   */
  templateVersion?: string;
};

