import isNil from 'lodash/isNil';
import type {
  AuthOrganizationAssignment,
  AuthProvider,
  AuthProviderSpec,
  AuthRoleAssignment,
  OAuth2ProviderSpec,
  PatchRequest,
} from '@flightctl/types';
import type { DynamicAuthProviderSpec } from '../../../types/extraTypes';
import { appendJSONPatch } from '../../../utils/patches/patch';
import { getAuthProvider, getFormPrompt } from './utils';
import {
  type AuthProviderFormValues,
  DEFAULT_PROMPT,
  DEFAULT_ROLE_SEPARATOR,
  OrgAssignmentType,
  RoleAssignmentType,
  isOAuth2Provider,
  isOrgAssignmentDynamic,
  isOrgAssignmentPerUser,
  isOrgAssignmentStatic,
  isRoleAssignmentDynamic,
  isRoleAssignmentStatic,
} from './types';

/**
 * Deep equality check for AuthRoleAssignment objects.
 * Compares objects by their type and relevant fields, handling arrays properly.
 */
const isRoleAssignmentEqual = (a: AuthRoleAssignment, b: AuthRoleAssignment): boolean => {
  if (a.type !== b.type) {
    return false;
  }

  switch (a.type) {
    case RoleAssignmentType.Static: {
      if (!isRoleAssignmentStatic(b)) {
        return false;
      }
      const aRoles = a.roles || [];
      const bRoles = b.roles || [];
      if (aRoles.length !== bRoles.length) {
        return false;
      }
      // Compare roles arrays (order matters for roles)
      return aRoles.every((val, idx) => val === bRoles[idx]);
    }
    case RoleAssignmentType.Dynamic: {
      if (!isRoleAssignmentDynamic(b)) {
        return false;
      }
      const aClaimPath = a.claimPath || [];
      const bClaimPath = b.claimPath || [];
      if (aClaimPath.length !== bClaimPath.length) {
        return false;
      }
      // Compare claim path arrays (order matters)
      if (!aClaimPath.every((val, idx) => val === bClaimPath[idx])) {
        return false;
      }
      return (a.separator || DEFAULT_ROLE_SEPARATOR) === (b.separator || DEFAULT_ROLE_SEPARATOR);
    }
    default: {
      return false;
    }
  }
};

/**
 * Deep equality check for AuthOrganizationAssignment objects.
 * Compares objects by their type and relevant fields, handling arrays properly.
 */
const isOrgAssignmentEqual = (a: AuthOrganizationAssignment, b: AuthOrganizationAssignment): boolean => {
  if (a.type !== b.type) {
    return false;
  }

  switch (a.type) {
    case OrgAssignmentType.Static: {
      if (!isOrgAssignmentStatic(b)) {
        return false;
      }
      return (a.organizationName || '') === (b.organizationName || '');
    }
    case OrgAssignmentType.Dynamic: {
      if (!isOrgAssignmentDynamic(b)) {
        return false;
      }
      const aClaimPath = a.claimPath || [];
      const bClaimPath = b.claimPath || [];
      if (aClaimPath.length !== bClaimPath.length) {
        return false;
      }
      if (!aClaimPath.every((val, idx) => val === bClaimPath[idx])) {
        return false;
      }
      return (
        (a.organizationNamePrefix || '') === (b.organizationNamePrefix || '') &&
        (a.organizationNameSuffix || '') === (b.organizationNameSuffix || '')
      );
    }
    case OrgAssignmentType.PerUser: {
      if (!isOrgAssignmentPerUser(b)) {
        return false;
      }
      return (
        (a.organizationNamePrefix || '') === (b.organizationNamePrefix || '') &&
        (a.organizationNameSuffix || '') === (b.organizationNameSuffix || '')
      );
    }
    default: {
      return false;
    }
  }
};

export const patchAuthProviderFields = (
  patches: PatchRequest,
  spec: DynamicAuthProviderSpec,
  newSpec: DynamicAuthProviderSpec,
  options: { skipSecrets?: boolean } = {},
) => {
  const { skipSecrets = false } = options;

  appendJSONPatch({
    patches,
    originalValue: spec.issuer,
    newValue: newSpec.issuer,
    path: '/spec/issuer',
  });

  appendJSONPatch({
    patches,
    originalValue: spec.clientId,
    newValue: newSpec.clientId,
    path: '/spec/clientId',
  });

  if (!skipSecrets) {
    appendJSONPatch({
      patches,
      originalValue: spec.clientSecret,
      newValue: newSpec.clientSecret,
      path: '/spec/clientSecret',
    });
  }

  appendJSONPatch({
    patches,
    originalValue: spec.enabled ?? true,
    newValue: newSpec.enabled ?? true,
    path: '/spec/enabled',
  });

  if (JSON.stringify(spec.scopes) !== JSON.stringify(newSpec.scopes)) {
    appendJSONPatch({
      patches,
      originalValue: spec.scopes,
      newValue: newSpec.scopes,
      path: '/spec/scopes',
    });
  }

  // Send the new value as-is, including empty string (which means that the prompt is omitted)
  const originalFormPrompt = getFormPrompt(spec.prompt);
  const newFormPrompt = newSpec.prompt ?? DEFAULT_PROMPT;
  if (originalFormPrompt !== newFormPrompt) {
    patches.push({
      op: isNil(spec.prompt) ? 'add' : 'replace',
      path: '/spec/prompt',
      value: newFormPrompt,
    });
  }

  const orgAssignmentChanged = !isOrgAssignmentEqual(spec.organizationAssignment, newSpec.organizationAssignment);
  if (orgAssignmentChanged) {
    appendJSONPatch({
      patches,
      originalValue: spec.organizationAssignment,
      newValue: newSpec.organizationAssignment,
      path: '/spec/organizationAssignment',
    });
  }

  appendJSONPatch({
    patches,
    originalValue: spec.displayName,
    newValue: newSpec.displayName,
    path: '/spec/displayName',
  });

  appendJSONPatch({
    patches,
    originalValue: spec.usernameClaim,
    newValue: newSpec.usernameClaim,
    path: '/spec/usernameClaim',
  });

  const roleAssignmentChanged = !isRoleAssignmentEqual(spec.roleAssignment, newSpec.roleAssignment);
  if (roleAssignmentChanged) {
    appendJSONPatch({
      patches,
      originalValue: spec.roleAssignment,
      newValue: newSpec.roleAssignment,
      path: '/spec/roleAssignment',
    });
  }
};

const patchProviderTypeSpecificFields = (patches: PatchRequest, spec: AuthProviderSpec, newSpec: AuthProviderSpec) => {
  const oauth2Fields: Array<keyof OAuth2ProviderSpec> = ['authorizationUrl', 'tokenUrl', 'userinfoUrl'];

  const wasOAuth2Before = isOAuth2Provider(spec);
  const isNowOAuth2 = isOAuth2Provider(newSpec);

  if (isNowOAuth2) {
    oauth2Fields.forEach((field) => {
      appendJSONPatch({
        patches,
        originalValue: wasOAuth2Before ? spec[field] : undefined,
        newValue: newSpec[field],
        path: `/spec/${field}`,
      });
    });
  } else if (wasOAuth2Before) {
    // Changing from Oauth2 to OIDC, we need to remove the Oauth2 specific fields
    oauth2Fields.forEach((field) => {
      patches.push({ op: 'remove', path: `/spec/${field}` });
    });
  }
};

export const getAuthProviderPatches = (values: AuthProviderFormValues, authProvider: AuthProvider): PatchRequest => {
  const patches: PatchRequest = [];
  const prevSpec = authProvider.spec as DynamicAuthProviderSpec;

  const newAuthProvider = getAuthProvider(values);
  const newSpec = newAuthProvider.spec as DynamicAuthProviderSpec;

  const providerTypeChanged = prevSpec.providerType !== newSpec.providerType;
  const secretWasChanged = prevSpec.clientSecret !== newSpec.clientSecret;

  // If provider type changed AND user provided a new secret, we can do a full replace
  if (providerTypeChanged && secretWasChanged) {
    patches.push({
      op: 'replace',
      path: '/spec',
      value: newSpec,
    });
    return patches;
  }

  // In every other case, we need to patch the fields individually
  if (providerTypeChanged) {
    patches.push({
      op: 'replace',
      path: '/spec/providerType',
      value: newSpec.providerType,
    });
  }

  // Patch all common fields
  patchAuthProviderFields(patches, prevSpec, newSpec, { skipSecrets: !secretWasChanged });

  // Handle provider-specific fields (OAuth2 vs OIDC)
  patchProviderTypeSpecificFields(patches, prevSpec, newSpec);

  return patches;
};
