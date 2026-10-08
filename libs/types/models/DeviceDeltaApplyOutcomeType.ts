/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Result reported by the agent for an update target. NotRequired means the target image is already present on the device with the correct digest, so no delta or pull was needed. NotUsed means the agent skipped delta application without a delta-apply failure; it may still use a full image pull. Applied means all delta work for the target succeeded. Fallback means a delta attempt failed and the agent attempted a full image pull. Partial means an application applied at least one delta while another image target used a full image pull or skipped delta application.
 */
export enum DeviceDeltaApplyOutcomeType {
  DeviceDeltaApplyOutcomeNotUsed = 'NotUsed',
  DeviceDeltaApplyOutcomeNotRequired = 'NotRequired',
  DeviceDeltaApplyOutcomeApplied = 'Applied',
  DeviceDeltaApplyOutcomeFallback = 'Fallback',
  DeviceDeltaApplyOutcomePartial = 'Partial',
}
