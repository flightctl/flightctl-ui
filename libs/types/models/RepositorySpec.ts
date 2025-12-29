/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GenericRepoSpec } from './GenericRepoSpec';
import type { HttpRepoSpec } from './HttpRepoSpec';
import type { OciRepoSpec } from './OciRepoSpec';
import type { SshRepoSpec } from './SshRepoSpec';
/**
 * RepositorySpec describes a configuration repository.
 */
export type RepositorySpec = (GenericRepoSpec | HttpRepoSpec | SshRepoSpec | OciRepoSpec);

