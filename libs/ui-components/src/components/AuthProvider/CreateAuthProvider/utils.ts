import * as Yup from 'yup';
import { TFunction } from 'i18next';
import {
  ApiVersion,
  AuthDynamicRoleAssignment,
  AuthOrganizationAssignment,
  AuthProvider,
  AuthProviderSpec,
  AuthRoleAssignment,
  AuthStaticRoleAssignment,
  OAuth2ProviderSpec,
  PatchRequest,
} from '@flightctl/types';
import { appendJSONPatch } from '../../../utils/patch';
import {
  AuthProviderFormValues,
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
import { validKubernetesDnsSubdomain } from '../../form/validations';
import { DynamicAuthProviderSpec, ProviderType } from '../../../types/extraTypes';

export const getAssignmentTypeLabel = (
  type: AuthOrganizationAssignment['type'] | AuthRoleAssignment['type'] | undefined,
  t: TFunction,
) => {
  switch (type) {
    case OrgAssignmentType.Static: {
      return t('Static');
    }
    case OrgAssignmentType.Dynamic: {
      return t('Dynamic');
    }
    case OrgAssignmentType.PerUser: {
      return t('Per user');
    }
    default: {
      return 'N/A';
    }
  }
};

export const getProviderTypeLabel = (type: AuthProviderSpec['providerType'], t: TFunction) => {
  switch (type) {
    case ProviderType.OIDC: {
      return t('OIDC');
    }
    case ProviderType.OAuth2: {
      return t('OAuth2');
    }
    default: {
      return 'N/A';
    }
  }
};

export const getInitValues = (authProvider?: AuthProvider): AuthProviderFormValues => {
  if (!authProvider) {
    return {
      exists: false,
      enabled: true,
      name: '',
      displayName: '',
      providerType: ProviderType.OIDC,
      issuer: '',
      clientId: '',
      clientSecret: '',
      scopes: [],
      usernameClaim: [],
      roleAssignmentType: RoleAssignmentType.Static,
      roleClaimPath: [],
      roleSeparator: DEFAULT_ROLE_SEPARATOR,
      staticRoles: [],
      orgAssignmentType: OrgAssignmentType.Static,
      orgName: '',
      claimPath: [],
      orgNamePrefix: '',
      orgNameSuffix: '',
    };
  }

  let orgAssignmentType: OrgAssignmentType;
  let orgName = '';
  let claimPath: string[] = [];
  let orgNamePrefix = '';
  let orgNameSuffix = '';

  const spec = authProvider.spec as DynamicAuthProviderSpec;

  const orgAssignment = spec.organizationAssignment;
  if (isOrgAssignmentDynamic(orgAssignment)) {
    orgAssignmentType = OrgAssignmentType.Dynamic;
    claimPath = orgAssignment.claimPath || [];
    orgNamePrefix = orgAssignment.organizationNamePrefix || '';
    orgNameSuffix = orgAssignment.organizationNameSuffix || '';
  } else if (isOrgAssignmentPerUser(orgAssignment)) {
    orgAssignmentType = OrgAssignmentType.PerUser;
    orgNamePrefix = orgAssignment.organizationNamePrefix || '';
    orgNameSuffix = orgAssignment.organizationNameSuffix || '';
  } else {
    orgAssignmentType = OrgAssignmentType.Static;
    orgName = orgAssignment.organizationName;
  }

  let roleAssignmentType: RoleAssignmentType = RoleAssignmentType.Dynamic;
  let roleClaimPath: string[] = [];
  let roleSeparator: string = DEFAULT_ROLE_SEPARATOR;
  let staticRoles: string[] = [];

  const roleAssignment = spec.roleAssignment;
  if (isRoleAssignmentStatic(roleAssignment)) {
    roleAssignmentType = RoleAssignmentType.Static;
    staticRoles = roleAssignment.roles || [];
  } else if (isRoleAssignmentDynamic(roleAssignment)) {
    roleAssignmentType = RoleAssignmentType.Dynamic;
    roleClaimPath = roleAssignment.claimPath || [];
    roleSeparator = roleAssignment.separator || DEFAULT_ROLE_SEPARATOR;
  }

  const isOAuth2 = isOAuth2Provider(spec);
  return {
    exists: true,
    name: authProvider.metadata.name as string,
    displayName: spec.displayName,
    providerType: spec.providerType as ProviderType,
    issuer: spec.issuer || '',
    clientId: spec.clientId,
    clientSecret: spec.clientSecret,
    enabled: spec.enabled ?? true,
    authorizationUrl: isOAuth2 ? spec.authorizationUrl : undefined,
    tokenUrl: isOAuth2 ? spec.tokenUrl : undefined,
    userinfoUrl: isOAuth2 ? spec.userinfoUrl : undefined,
    scopes: spec.scopes || [],
    usernameClaim: spec.usernameClaim || [],
    roleAssignmentType,
    roleClaimPath,
    roleSeparator,
    staticRoles,
    orgAssignmentType,
    orgName,
    claimPath,
    orgNamePrefix,
    orgNameSuffix,
  };
};

const getOrgAssignment = (values: AuthProviderFormValues): AuthOrganizationAssignment => {
  if (values.orgAssignmentType === OrgAssignmentType.Static) {
    return {
      type: OrgAssignmentType.Static,
      organizationName: values.orgName || '',
    };
  }

  let orgAssignment: AuthOrganizationAssignment;
  if (values.orgAssignmentType === OrgAssignmentType.PerUser) {
    orgAssignment = {
      type: OrgAssignmentType.PerUser,
      organizationNamePrefix: values.orgNamePrefix,
      organizationNameSuffix: values.orgNameSuffix,
    };
  } else {
    orgAssignment = {
      type: OrgAssignmentType.Dynamic,
      claimPath: values.claimPath || [],
      organizationNamePrefix: values.orgNamePrefix,
      organizationNameSuffix: values.orgNameSuffix,
    };
  }

  return orgAssignment;
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

const getRoleAssignment = (values: AuthProviderFormValues): AuthRoleAssignment => {
  if (values.roleAssignmentType === RoleAssignmentType.Static) {
    const staticAssignment: AuthStaticRoleAssignment = {
      type: RoleAssignmentType.Static,
      roles: values.staticRoles || [],
    };
    return staticAssignment as AuthRoleAssignment;
  } else {
    const dynamicAssignment: AuthDynamicRoleAssignment = {
      type: RoleAssignmentType.Dynamic,
      claimPath: values.roleClaimPath || [],
      separator: values.roleSeparator || DEFAULT_ROLE_SEPARATOR,
    };
    return dynamicAssignment as AuthRoleAssignment;
  }
};

export const getAuthProvider = (values: AuthProviderFormValues): AuthProvider => {
  const baseSpec = {
    providerType: values.providerType,
    displayName: values.displayName,
    clientId: values.clientId,
    clientSecret: values.clientSecret,
    enabled: values.enabled,
    issuer: values.issuer,
    scopes: values.scopes,
    usernameClaim: values.usernameClaim || [],
    roleAssignment: getRoleAssignment(values),
    organizationAssignment: getOrgAssignment(values),
  };

  let spec: AuthProviderSpec;
  if (values.providerType === ProviderType.OAuth2) {
    spec = {
      ...baseSpec,
      providerType: ProviderType.OAuth2,
      authorizationUrl: values.authorizationUrl || '',
      tokenUrl: values.tokenUrl || '',
      userinfoUrl: values.userinfoUrl || '',
    };
  } else {
    spec = {
      ...baseSpec,
      providerType: ProviderType.OIDC,
    };
  }

  return {
    apiVersion: ApiVersion.ApiVersionV1beta1,
    kind: 'AuthProvider',
    metadata: {
      name: values.name,
    },
    spec,
  };
};

const patchAuthProviderFields = (
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

export const authProviderSchema = (t: TFunction) => (values: AuthProviderFormValues) => {
  const baseSchema = {
    name: validKubernetesDnsSubdomain(t, { isRequired: true }),
    providerType: Yup.string().oneOf(Object.values(ProviderType)).required(t('Provider type is required')),
    clientId: Yup.string().required(t('Client ID is required')),
    clientSecret: Yup.string().required(t('Client secret is required')),
    enabled: Yup.boolean(),
    scopes: Yup.array()
      .of(Yup.string())
      .test('unique-scopes', t('Please remove duplicate scopes'), (scopes) => {
        const uniqueScopes = new Set(scopes || []);
        return uniqueScopes.size === scopes?.length;
      }),
    usernameClaim: Yup.array().of(Yup.string()),
    roleAssignmentType: Yup.string().oneOf(Object.values(RoleAssignmentType)),
    roleClaimPath: Yup.array()
      .of(Yup.string())
      .when('roleAssignmentType', (roleAssignmentType, schema) => {
        const roleType = (
          Array.isArray(roleAssignmentType) ? roleAssignmentType[0] : roleAssignmentType
        ) as RoleAssignmentType;
        return roleType === RoleAssignmentType.Dynamic
          ? schema.min(1, t('At least one claim path segment is required for dynamic role assignment'))
          : schema;
      }),
    roleSeparator: Yup.string().optional().nullable(),
    staticRoles: Yup.array()
      .of(Yup.string())
      .when('roleAssignmentType', (roleAssignmentType, schema) => {
        const roleType = (
          Array.isArray(roleAssignmentType) ? roleAssignmentType[0] : roleAssignmentType
        ) as RoleAssignmentType;
        return roleType === RoleAssignmentType.Static
          ? schema.min(1, t('At least one role is required for static role assignment'))
          : schema;
      }),
    orgAssignmentType: Yup.string()
      .oneOf(Object.values(OrgAssignmentType))
      .required(t('Organization assignment type is required')),
  };

  let schema: Record<string, Yup.Schema> = { ...baseSchema };

  // Issuer validation is provider-type specific
  if (values.providerType === ProviderType.OIDC) {
    // OIDC: issuer is required
    schema = {
      ...schema,
      issuer: Yup.string().required(t('Issuer is required')).url(t('Must be a valid URL')),
    };
  } else if (values.providerType === ProviderType.OAuth2) {
    // OAuth2: issuer is optional but must be a valid URL if provided
    schema = {
      ...schema,
      issuer: Yup.string().url(t('Must be a valid URL')),
      authorizationUrl: Yup.string().required(t('Authorization URL is required')).url(t('Must be a valid URL')),
      tokenUrl: Yup.string().required(t('Token URL is required')).url(t('Must be a valid URL')),
      userinfoUrl: Yup.string().required(t('Userinfo URL is required')).url(t('Must be a valid URL')),
    };
  }

  if (values.orgAssignmentType === OrgAssignmentType.Static) {
    schema = {
      ...schema,
      orgName: Yup.string().required(t('Static organization assignment requires an organization name')),
    };
  } else if (values.orgAssignmentType === OrgAssignmentType.Dynamic) {
    schema = {
      ...schema,
      claimPath: Yup.array()
        .of(Yup.string())
        .min(1, t('At least one claim path segment is required'))
        .required(t('Claim path is required')),
      orgNamePrefix: Yup.string(),
      orgNameSuffix: Yup.string(),
    };
  } else if (values.orgAssignmentType === OrgAssignmentType.PerUser) {
    schema = {
      ...schema,
      orgNamePrefix: Yup.string(),
      orgNameSuffix: Yup.string(),
    };
  }

  return Yup.object().shape(schema);
};
