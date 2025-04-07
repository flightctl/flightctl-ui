/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationEnvVars } from './ApplicationEnvVars';
import type { AppType } from './AppType';
import type { ImageApplicationProviderSpec } from './ImageApplicationProviderSpec';
import type { InlineApplicationProviderSpec } from './InlineApplicationProviderSpec';
export type ApplicationProviderSpec = (ApplicationEnvVars & {
  /**
   * The application name must be 1–253 characters long, start with a letter or number, and contain no whitespace.
   */
  name?: string;
  appType?: AppType;
} & (ImageApplicationProviderSpec | InlineApplicationProviderSpec));

