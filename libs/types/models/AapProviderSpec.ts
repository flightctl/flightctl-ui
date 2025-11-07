/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthOrganizationAssignment } from './AuthOrganizationAssignment';
import type { AuthRoleAssignment } from './AuthRoleAssignment';
/**
 * AapProviderSpec describes an Ansible Automation Platform (AAP) provider configuration.
 */
export type AapProviderSpec = {
  /**
   * The type of authentication provider.
   */
  providerType: 'aap';
  /**
   * Human-readable display name for the provider.
   */
  displayName?: string;
  /**
   * The internal AAP API URL.
   */
  apiUrl: string;
  /**
   * The external AAP API URL (for external access).
   */
  externalApiUrl?: string;
  /**
   * Whether this AAP provider is enabled.
   */
  enabled?: boolean;
  organizationAssignment: AuthOrganizationAssignment;
  roleAssignment: AuthRoleAssignment;
};

