/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * AuthStaticOrganizationAssignment assigns all users from this auth provider to a single static organization.
 */
export type AuthStaticOrganizationAssignment = {
  /**
   * The type of organization assignment.
   */
  type: 'static';
  /**
   * The name of the organization where all users will be assigned.
   */
  organizationName: string;
};

