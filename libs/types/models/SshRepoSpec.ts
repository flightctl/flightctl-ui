/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RepoSpecType } from './RepoSpecType';
import type { SshConfig } from './SshConfig';
export type SshRepoSpec = {
  /**
   * The SSH Git repository URL to clone from.
   */
  url: string;
  type: RepoSpecType;
  sshConfig: SshConfig;
};

