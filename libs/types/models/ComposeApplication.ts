/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationEnvVars } from './ApplicationEnvVars';
import type { ApplicationProviderBase } from './ApplicationProviderBase';
import type { ApplicationVolumeProviderSpec } from './ApplicationVolumeProviderSpec';
import type { ImageApplicationProviderSpec } from './ImageApplicationProviderSpec';
import type { InlineApplicationProviderSpec } from './InlineApplicationProviderSpec';
export type ComposeApplication = (ApplicationProviderBase & ApplicationEnvVars & ApplicationVolumeProviderSpec & (ImageApplicationProviderSpec | InlineApplicationProviderSpec));

