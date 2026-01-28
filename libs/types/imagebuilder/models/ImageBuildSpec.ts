/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageBuildBinding } from './ImageBuildBinding';
import type { ImageBuildDestination } from './ImageBuildDestination';
import type { ImageBuildSource } from './ImageBuildSource';
import type { ImageBuildUserConfiguration } from './ImageBuildUserConfiguration';
/**
 * ImageBuildSpec describes the specification for an image build.
 */
export type ImageBuildSpec = {
  source: ImageBuildSource;
  destination: ImageBuildDestination;
  binding: ImageBuildBinding;
  userConfiguration?: ImageBuildUserConfiguration;
};

