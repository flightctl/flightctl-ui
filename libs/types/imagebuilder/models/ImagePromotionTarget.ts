/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExistingCatalogItemTarget } from './ExistingCatalogItemTarget';
import type { NewCatalogItemTarget } from './NewCatalogItemTarget';
/**
 * Specifies where and how to publish the artifact(s). The type field is the discriminator.
 */
export type ImagePromotionTarget = (NewCatalogItemTarget | ExistingCatalogItemTarget);

