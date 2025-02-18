/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationEnvVars } from './ApplicationEnvVars';
import type { ImageApplicationProvider } from './ImageApplicationProvider';
export type ApplicationProviderSpec = (ApplicationEnvVars & {
  /**
   * The name of the application must be between 1 and 253 characters and start with a letter or number.
   */
  name?: string;
} & ImageApplicationProvider);

