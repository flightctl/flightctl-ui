/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GitRepoSpec } from './GitRepoSpec';
import type { HttpRepoSpec } from './HttpRepoSpec';
import type { OciRepoSpec } from './OciRepoSpec';
/**
 * RepositorySpec describes a configuration repository.
 */
export type RepositorySpec = (GitRepoSpec | HttpRepoSpec | OciRepoSpec);

