/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationEnvVars } from './ApplicationEnvVars';
import type { ImageApplicationProvider } from './ImageApplicationProvider';
export type ApplicationProviderSpec = (ApplicationEnvVars & {
  /**
   * The application name must be 1–253 characters long, start with a letter or number, and contain no whitespace.
   */
  name?: string;
} & ImageApplicationProvider);

