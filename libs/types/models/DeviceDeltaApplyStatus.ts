/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceDeltaApplyOutcomeType } from './DeviceDeltaApplyOutcomeType';
/**
 * Agent-reported result for delta apply attempts for this update target. For an application with multiple image targets, the outcome is aggregated across image targets. The lastDelta field is omitted until the agent reports an outcome; server-side delta preparation is reported separately.
 */
export type DeviceDeltaApplyStatus = {
  outcome: DeviceDeltaApplyOutcomeType;
  /**
   * Set when one or more delta attempts failed and the agent attempted a full image pull. For an application with multiple image targets, this reports one representative failure reason.
   */
  fallbackReason?: string;
};

