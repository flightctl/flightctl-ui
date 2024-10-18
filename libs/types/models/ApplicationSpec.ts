/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationEnvVars } from './ApplicationEnvVars';
import type { ImageApplicationProvider } from './ImageApplicationProvider';
export type ApplicationSpec = (ApplicationEnvVars & {
  /**
   * The name of the application
   */
  name?: string;
} & ImageApplicationProvider);

