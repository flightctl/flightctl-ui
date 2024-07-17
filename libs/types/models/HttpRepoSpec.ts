/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HttpConfig } from './HttpConfig';
import type { RepoSpecType } from './RepoSpecType';
export type HttpRepoSpec = {
  /**
   * The HTTP URL to call or clone from
   */
  url: string;
  type: RepoSpecType;
  httpConfig: HttpConfig;
};

