/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * AuthPerUserOrganizationAssignment creates a separate organization for each user.
 */
export type AuthPerUserOrganizationAssignment = {
  /**
   * The type of organization assignment.
   */
  type: 'perUser';
  /**
   * The prefix for the user-specific organization name (e.g., "user-org-").
   */
  organizationNamePrefix?: string;
  /**
   * The suffix for the user-specific organization name (e.g., "-org").
   */
  organizationNameSuffix?: string;
};

