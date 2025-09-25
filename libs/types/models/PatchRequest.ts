/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PatchRequest = Array<{
  /**
   * A JSON Pointer path.
   */
  path: string;
  /**
   * The value to add or replace.
   */
  value?: any;
  /**
   * The operation to perform.
   */
  op: 'add' | 'replace' | 'remove' | 'test';
}>;
