/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Reason for the ImageBuild Ready condition.
 */
export enum ImageBuildConditionReason {
  ImageBuildConditionReasonPending = 'Pending',
  ImageBuildConditionReasonBuilding = 'Building',
  ImageBuildConditionReasonPushing = 'Pushing',
  ImageBuildConditionReasonGeneratingSBOM = 'GeneratingSBOM',
  ImageBuildConditionReasonCompleted = 'Completed',
  ImageBuildConditionReasonFailed = 'Failed',
  ImageBuildConditionReasonCanceling = 'Canceling',
  ImageBuildConditionReasonCanceled = 'Canceled',
}
