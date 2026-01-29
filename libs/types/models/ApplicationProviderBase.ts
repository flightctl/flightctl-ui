/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppType } from './AppType';
/**
 * Common properties for all application types.
 */
export type ApplicationProviderBase = {
  /**
   * The application name must be 1–253 characters long, start with a letter or number, and contain no whitespace.
   */
  name?: string;
  appType: AppType;
};

