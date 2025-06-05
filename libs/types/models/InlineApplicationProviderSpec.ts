/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationContent } from './ApplicationContent';
import type { ApplicationVolumeProviderSpec } from './ApplicationVolumeProviderSpec';
export type InlineApplicationProviderSpec = (ApplicationVolumeProviderSpec & {
  /**
   * A list of application content.
   */
  inline: Array<ApplicationContent>;
});

