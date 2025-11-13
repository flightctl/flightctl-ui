/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthDynamicOrganizationAssignment } from './AuthDynamicOrganizationAssignment';
import type { AuthPerUserOrganizationAssignment } from './AuthPerUserOrganizationAssignment';
import type { AuthStaticOrganizationAssignment } from './AuthStaticOrganizationAssignment';
/**
 * AuthOrganizationAssignment defines how users from this auth provider are assigned to organizations.
 */
export type AuthOrganizationAssignment = (AuthStaticOrganizationAssignment | AuthDynamicOrganizationAssignment | AuthPerUserOrganizationAssignment);

