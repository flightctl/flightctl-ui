/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiVersion } from './ApiVersion';
import type { ObjectMeta } from '../../models/ObjectMeta';
import type { ImagePromotionSpec } from './ImagePromotionSpec';
import type { ImagePromotionStatus } from './ImagePromotionStatus';
/**
 * ImagePromotion tracks a single publish attempt from an ImageBuild to a CatalogItem.
 */
export type ImagePromotion = {
  apiVersion: ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents.
   */
  kind: string;
  metadata: ObjectMeta;
  spec: ImagePromotionSpec;
  status?: ImagePromotionStatus;
};

