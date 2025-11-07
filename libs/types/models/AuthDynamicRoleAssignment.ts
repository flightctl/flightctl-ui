/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * AuthDynamicRoleAssignment extracts roles from auth provider claims using a JSON path.
 */
export type AuthDynamicRoleAssignment = {
  /**
   * The type of role assignment.
   */
  type: 'dynamic';
  /**
   * The JSON path to the role/group claim (e.g., ["groups"], ["roles"], ["realm_access", "roles"]).
   */
  claimPath: Array<string>;
};

