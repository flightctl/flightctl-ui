/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthDynamicRoleAssignment } from './AuthDynamicRoleAssignment';
import type { AuthStaticRoleAssignment } from './AuthStaticRoleAssignment';
/**
 * AuthRoleAssignment defines how roles are assigned to users from this auth provider.
 */
export type AuthRoleAssignment = (AuthStaticRoleAssignment | AuthDynamicRoleAssignment);

