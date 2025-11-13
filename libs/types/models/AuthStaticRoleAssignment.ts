/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * AuthStaticRoleAssignment assigns a static set of roles to all users from this auth provider.
 */
export type AuthStaticRoleAssignment = {
  /**
   * The type of role assignment.
   */
  type: 'static';
  /**
   * The list of role names to assign to all users.
   */
  roles: Array<string>;
};

