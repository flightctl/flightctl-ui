/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthOrganizationAssignment } from './AuthOrganizationAssignment';
import type { AuthRoleAssignment } from './AuthRoleAssignment';
/**
 * K8sProviderSpec describes a Kubernetes/OpenShift provider configuration.
 */
export type K8sProviderSpec = {
  /**
   * The type of authentication provider.
   */
  providerType: 'k8s';
  /**
   * Human-readable display name for the provider.
   */
  displayName?: string;
  /**
   * The internal Kubernetes API URL.
   */
  apiUrl: string;
  /**
   * The RBAC namespace for permissions.
   */
  rbacNs?: string;
  /**
   * Whether this K8s provider is enabled.
   */
  enabled?: boolean;
  organizationAssignment: AuthOrganizationAssignment;
  roleAssignment: AuthRoleAssignment;
  /**
   * Optional suffix to strip from ClusterRole names when normalizing role names. Used for multi-release deployments where ClusterRoles have namespace-specific names (e.g., flightctl-admin-<namespace>).
   */
  roleSuffix?: string;
};

