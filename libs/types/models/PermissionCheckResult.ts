/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Result of a single permission check.
 */
export type PermissionCheckResult = {
  /**
   * The resource that was checked.
   */
  resource: string;
  /**
   * The operation that was checked.
   */
  op: string;
  /**
   * Whether the operation is allowed on the resource.
   */
  allowed: boolean;
};

