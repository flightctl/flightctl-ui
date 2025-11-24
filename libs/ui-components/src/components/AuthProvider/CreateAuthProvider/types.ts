import {
  AuthDynamicOrganizationAssignment,
  AuthDynamicRoleAssignment,
  AuthOrganizationAssignment,
  AuthPerUserOrganizationAssignment,
  AuthProviderSpec,
  AuthRoleAssignment,
  AuthStaticOrganizationAssignment,
  AuthStaticRoleAssignment,
  OAuth2ProviderSpec,
  OIDCProviderSpec,
} from '@flightctl/types';
import { ProviderType } from '../../../types/extraTypes';

export enum OrgAssignmentType {
  Static = 'static',
  Dynamic = 'dynamic',
  PerUser = 'perUser',
}

export const DEFAULT_USERNAME_CLAIM = 'preferred_username';
export const DEFAULT_ROLE_CLAIM = 'groups';
export const DEFAULT_ROLE_SEPARATOR = ':';

export const isOidcProvider = (providerSpec: AuthProviderSpec): providerSpec is OIDCProviderSpec =>
  providerSpec.providerType === ProviderType.OIDC;

export const isOAuth2Provider = (providerSpec: AuthProviderSpec): providerSpec is OAuth2ProviderSpec =>
  providerSpec.providerType === ProviderType.OAuth2;

export const isOrgAssignmentStatic = (
  orgAssignment: AuthOrganizationAssignment,
): orgAssignment is AuthStaticOrganizationAssignment => orgAssignment.type === OrgAssignmentType.Static;

export const isOrgAssignmentDynamic = (
  orgAssignment: AuthOrganizationAssignment,
): orgAssignment is AuthDynamicOrganizationAssignment => orgAssignment.type === OrgAssignmentType.Dynamic;

export const isOrgAssignmentPerUser = (
  orgAssignment: AuthOrganizationAssignment,
): orgAssignment is AuthPerUserOrganizationAssignment => orgAssignment.type === OrgAssignmentType.PerUser;

export enum RoleAssignmentType {
  Static = 'static',
  Dynamic = 'dynamic',
}

export const isRoleAssignmentStatic = (
  roleAssignment: AuthRoleAssignment,
): roleAssignment is AuthStaticRoleAssignment => roleAssignment.type === RoleAssignmentType.Static;

export const isRoleAssignmentDynamic = (
  roleAssignment: AuthRoleAssignment,
): roleAssignment is AuthDynamicRoleAssignment => roleAssignment.type === RoleAssignmentType.Dynamic;

export type AuthProviderFormValues = {
  exists: boolean;
  name: string;
  displayName?: string;
  providerType: ProviderType;
  issuer: string;
  clientId: string;
  clientSecret: string;
  enabled: boolean;
  scopes: string[];
  usernameClaim?: string[]; // Array of path segments (e.g., ["preferred_username"] or ["custom", "user_id"])
  roleAssignmentType?: RoleAssignmentType;
  roleClaimPath?: string[]; // For dynamic role assignment
  roleSeparator?: string; // For dynamic role assignment - separator for org:role format
  staticRoles?: string[]; // For static role assignment

  // OAuth2 specific fields
  authorizationUrl?: string;
  tokenUrl?: string;
  userinfoUrl?: string;

  orgAssignmentType: OrgAssignmentType;
  orgName?: string; // OrgAssignment: Static only
  claimPath?: string[]; // OrgAssignment: Dynamic only - array of path segments
  orgNamePrefix?: string; // OrgAssignment: Dynamic and perUser
  orgNameSuffix?: string; // OrgAssignment: Dynamic and perUser
};

// Test connection types
export type FieldValidation = {
  valid: boolean;
  value?: string;
  notes?: string[];
};

export type FieldValidationResult = {
  field: string;
  valid: boolean;
  value?: string;
  notes?: string[];
};
