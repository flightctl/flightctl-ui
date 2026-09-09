/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Result of the most recent delta apply attempt for this update target.
 */
export type DeviceDeltaApplyStatus = {
  /**
   * Set when the most recent update attempt fell back from a delta to a full image pull. Absent if no delta was attempted or the delta succeeded. Cleared when the next update attempt for this target starts.
   */
  fallbackReason?: string;
  /**
   * Expected delta size in IEC units (KiB, MiB, GiB, or TiB). Absent when the size is not yet known.
   */
  size?: string;
};

