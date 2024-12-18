/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationEnvVars } from './ApplicationEnvVars';
import type { ImageApplicationProvider } from './ImageApplicationProvider';
/**
 * RenderedApplicationSpec describes the rendered and self-contained specification of an application.
 */
export type RenderedApplicationSpec = (ApplicationEnvVars & {
  /**
   * An application name.
   */
  name?: string;
} & ImageApplicationProvider);

