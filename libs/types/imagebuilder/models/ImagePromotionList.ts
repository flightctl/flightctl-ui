/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiVersion } from './ApiVersion';
import type { ListMeta } from '../../models/ListMeta';
import type { ImagePromotion } from './ImagePromotion';
/**
 * ImagePromotionList is a list of ImagePromotion resources.
 */
export type ImagePromotionList = {
  apiVersion: ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents.
   */
  kind: string;
  metadata: ListMeta;
  /**
   * List of ImagePromotion resources.
   */
  items: Array<ImagePromotion>;
};

