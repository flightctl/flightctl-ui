/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PermissionCheckItem } from './PermissionCheckItem';
/**
 * Request to check multiple permissions.
 */
export type PermissionCheckRequest = {
  /**
   * List of resource-operation pairs to check.
   */
  permissions: Array<PermissionCheckItem>;
};

