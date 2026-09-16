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
  /**
   * Device only. The rendered spec hash this prepare is for. Required when involvedObject.kind is Device; omitted for Fleet.
   */
  specHash?: string;
  /**
   * The resource version of the involved Fleet or Device when this prepare event was created. Used to ignore stale prepare events. May be omitted for retained events created before this field was introduced.
   */
  resourceVersion?: string;
};

