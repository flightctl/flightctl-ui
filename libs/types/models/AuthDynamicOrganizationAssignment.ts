/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * AuthDynamicOrganizationAssignment assigns users to organizations based on auth provider claims.
 */
export type AuthDynamicOrganizationAssignment = {
  /**
   * The type of organization assignment.
   */
  type: 'dynamic';
  /**
   * The JSON path to the claim that contains the organization identifier (e.g., ["groups", "0"] or ["custom", "org"]).
   */
  claimPath: Array<string>;
  /**
   * The prefix for the organization name (e.g., "org-").
   */
  organizationNamePrefix?: string;
  /**
   * The suffix for the organization name (e.g., "-org").
   */
  organizationNameSuffix?: string;
};

