/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageOrCatalogItemRefSpec } from './ImageOrCatalogItemRefSpec';
/**
 * Either a specific OCI image reference, or a reference to a catalog item version that can be resolved to an OCI image ref.
 */
export type DeviceOsSpec = (ImageOrCatalogItemRefSpec & {
  /**
   * Optional hint: a reference to a delta artifact the control plane's generation records indicate may be applicable to reach `image` from this device's current image. Absent does not imply no delta exists — the device independently discovers candidate delta artifacts (e.g. deltas published by a customer's own CI) regardless of this field, and falls back to a full pull only if none is usable.
   */
  deltaImage?: string;
});

