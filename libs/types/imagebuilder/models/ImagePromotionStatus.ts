/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ArtifactPromotionStatus } from './ArtifactPromotionStatus';
import type { ImagePromotionCondition } from './ImagePromotionCondition';
/**
 * Observed state of an ImagePromotion resource.
 */
export type ImagePromotionStatus = {
  /**
   * Conditions describing the current state of the promotion lifecycle.
   */
  conditions?: Array<ImagePromotionCondition>;
  /**
   * Timestamp of the initial successful promotion. Set once when the promotion first reaches Completed state. Not updated by subsequent amendments.
   */
  publishedAt?: string;
  /**
   * Timestamp of the most recent successful amendment (i.e., when the last additional export format was written to the CatalogItemVersion). Absent if the promotion has never been amended.
   */
  lastAmendedAt?: string;
  /**
   * Per-artifact readiness summary. One entry for the ImageBuild (container artifact) and one entry per requested exportFormat. Updated as artifacts become available or as new formats are added via PATCH/PUT.
   */
  artifactStatuses?: Array<ArtifactPromotionStatus>;
};

