/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationProviderBase } from './ApplicationProviderBase';
import type { CatalogItemRefApplicationProviderSpec } from './CatalogItemRefApplicationProviderSpec';
import type { ImageApplicationProviderSpec } from './ImageApplicationProviderSpec';
export type HelmApplication = (ApplicationProviderBase & (ImageApplicationProviderSpec | CatalogItemRefApplicationProviderSpec) & {
  /**
   * The target namespace for the application deployment.
   */
  namespace?: string;
  /**
   * Configuration values for the application. Supports arbitrarily nested structures.
   */
  values?: Record<string, any>;
  /**
   * List of values files to apply during deployment. Files are relative paths and applied in array order before user-provided values.
   */
  valuesFiles?: Array<string>;
});

