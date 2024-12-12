/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FileOperation } from './FileOperation';
export type HookConditionPathOp = {
  /**
   * The absolute path to a file or directory that must have changed as condition for the action to be performed.
   */
  path: string;
  /**
   * The operation(s) on files at or below the path that satisfy the path condition.
   */
  op: Array<FileOperation>;
};

