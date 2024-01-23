/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RepositoryCondition } from './RepositoryCondition';
/**
 * RepositoryStatus represents information about the status of a repository. Status may trail the actual state of a repository.
 */
export type RepositoryStatus = {
  /**
   * Current state of the repository.
   */
  conditions?: Array<RepositoryCondition>;
};

