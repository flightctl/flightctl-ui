/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A permission defining allowed operations on a resource.
 */
export type Permission = {
  /**
   * The resource (e.g., "devices", "fleets", "*" for all resources).
   */
  resource: string;
  /**
   * List of allowed operations (e.g., "get", "list", "create", "update", "patch", "delete", "*" for all operations).
   */
  operations: Array<string>;
};

