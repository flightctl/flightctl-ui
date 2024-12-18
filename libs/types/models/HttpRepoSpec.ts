/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HttpConfig } from './HttpConfig';
import type { RepoSpecType } from './RepoSpecType';
export type HttpRepoSpec = {
  /**
   * The HTTP URL to call or clone from.
   */
  url: string;
  type: RepoSpecType;
  httpConfig: HttpConfig;
  /**
   * URL suffix used only for validating access to the repository. Users might use the URL field as a root URL to be used by config sources adding suffixes. This will help with the validation of the http endpoint.
   */
  validationSuffix?: string;
};

