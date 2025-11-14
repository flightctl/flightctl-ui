/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A single permission check request item.
 */
export type PermissionCheckItem = {
  /**
   * The resource to check (e.g., "devices", "fleets").
   */
  resource: string;
  /**
   * The operation to check (e.g., "read", "write", "delete").
   */
  op: string;
};

