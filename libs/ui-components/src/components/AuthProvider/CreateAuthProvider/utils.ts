import * as Yup from 'yup';
import { type TFunction } from 'i18next';
import {
  ApiVersion,
  type AuthDynamicRoleAssignment,
  type AuthOrganizationAssignment,
  type AuthProvider,
  type AuthProviderSpec,
  type AuthRoleAssignment,
  type AuthStaticRoleAssignment,
} from '@flightctl/types';
import {
  type AuthProviderFormValues,
  DEFAULT_PROMPT,
  DEFAULT_ROLE_SEPARATOR,
  OrgAssignmentType,
  RoleAssignmentType,
  isOAuth2Provider,
  isOrgAssignmentDynamic,
  isOrgAssignmentPerUser,
  isRoleAssignmentDynamic,
  isRoleAssignmentStatic,
} from './types';
import { validKubernetesDnsSubdomain } from '../../form/validations';
import { type DynamicAuthProviderSpec, ProviderType } from '../../../types/extraTypes';

/** Empty string means prompt is omitted. Unset values means default prompt is used. */
export const getFormPrompt = (prompt: string | null | undefined): string =>
  prompt == null || prompt === undefined ? DEFAULT_PROMPT : prompt;

const PROMPT_PATTERN = /^(| *[!-~]+( +[!-~]+)* *)$/;

const isExclusiveNonePrompt = (prompt: string): boolean => {
  const tokens = prompt.split(' ').filter((token) => token !== '');
  const hasNone = tokens.includes('none');
  const hasOther = tokens.some((token) => token !== 'none');
  return !(hasNone && hasOther);
};

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
      prompt: DEFAULT_PROMPT,
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
    prompt: getFormPrompt(spec.prompt),
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
    prompt: values.prompt,
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
    prompt: Yup.string()
      .test(
        'prompt-pattern',
        t('Prompt must be empty or space-separated printable ASCII values'),
        (value) => !value || PROMPT_PATTERN.test(value),
      )
      .test(
        'prompt-none-exclusive',
        t('The value "none" cannot be combined with other prompt values'),
        (value) => !value || isExclusiveNonePrompt(value),
      ),
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
