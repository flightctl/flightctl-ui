/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HttpConfig } from './HttpConfig';
import type { SshConfig } from './SshConfig';
/**
 * Git repository specification. Supports no auth (public repos), HTTP/HTTPS auth, or SSH auth.
 */
export type GitRepoSpec = {
  /**
   * The Git repository URL to clone from.
   */
  url: string;
  /**
   * The repository type discriminator.
   */
  type: 'git';
  httpConfig?: HttpConfig;
  sshConfig?: SshConfig;
};

