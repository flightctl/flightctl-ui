import * as Yup from 'yup';
import { TFunction } from 'i18next';
import {
  ApiVersion,
  DockerAuth,
  GitRepoSpec,
  HttpConfig,
  HttpRepoSpec,
  OciAuthType,
  OciRepoSpec,
  PatchRequest,
  RepoSpecType,
  Repository,
  RepositorySpec,
  ResourceSync,
  SshConfig,
} from '@flightctl/types';

import { RepositoryFormValues, ResourceSyncFormValue } from './types';
import { getErrorMessage } from '../../../utils/error';
import { appendJSONPatch } from '../../../utils/patch';
import { MAX_TARGET_REVISION_LENGTH, maxLengthString, validKubernetesDnsSubdomain } from '../../form/validations';

const MAX_PATH_LENGTH = 2048;
const gitRepoUrlRegex = new RegExp(
  /^((http|git|ssh|http(s)|file|\/?)|(git@[\w.]+))(:(\/\/)?)([\w.@:/\-~]+)(\.git)?(\/)?$/,
);
const httpRepoUrlRegex = /^(http|https)/;
const pathRegex = /\/.+/;
const jwtTokenRegexp = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

export const isHttpRepoSpec = (repoSpec: RepositorySpec): repoSpec is HttpRepoSpec =>
  repoSpec.type === RepoSpecType.RepoSpecTypeHttp;
export const isGitRepoSpec = (repoSpec: RepositorySpec): repoSpec is GitRepoSpec =>
  repoSpec.type === RepoSpecType.RepoSpecTypeGit;
export const isOciRepoSpec = (repoSpec: RepositorySpec): repoSpec is OciRepoSpec =>
  repoSpec.type === RepoSpecType.RepoSpecTypeOci;

export const hasCredentialsSettings = (repoSpec: RepositorySpec): boolean => {
  // The credentials settings can be in different fields depending on the repository type
  if ('sshConfig' in repoSpec) {
    return Boolean(repoSpec.sshConfig?.sshPrivateKey);
  } else if ('httpConfig' in repoSpec) {
    return Boolean(
      repoSpec.httpConfig?.password || repoSpec.httpConfig?.['tls.crt'] || repoSpec.httpConfig?.['tls.key'],
    );
  } else if ('ociAuth' in repoSpec) {
    return Boolean(repoSpec.ociAuth);
  }
  return false;
};

const addHttpConfigPatches = (
  patches: PatchRequest,
  values: RepositoryFormValues,
  httpConfig: HttpConfig | undefined,
) => {
  // If httpConfig doesn't exist, create it as a whole object
  if (!httpConfig) {
    const value: HttpConfig = {
      skipServerVerification: values.httpConfig?.skipServerVerification,
    };

    if (values.httpConfig?.caCrt && !value.skipServerVerification) {
      value['ca.crt'] = btoa(values.httpConfig.caCrt);
    }

    if (values.httpConfig?.basicAuth?.use) {
      value.password = values.httpConfig.basicAuth.password;
      value.username = values.httpConfig.basicAuth.username;
    }
    if (values.httpConfig?.mTlsAuth?.use) {
      if (values.httpConfig.mTlsAuth.tlsCrt) {
        value['tls.crt'] = btoa(values.httpConfig.mTlsAuth.tlsCrt);
      }
      if (values.httpConfig.mTlsAuth.tlsKey) {
        value['tls.key'] = btoa(values.httpConfig.mTlsAuth.tlsKey);
      }
    }
    if (values.httpConfig?.token) {
      value.token = values.httpConfig.token;
    }
    patches.push({
      op: 'add',
      path: '/spec/httpConfig',
      value,
    });
    return;
  }

  // httpConfig exists, patch individual properties
  appendJSONPatch({
    patches,
    newValue: values.httpConfig?.skipServerVerification,
    originalValue: httpConfig?.skipServerVerification,
    path: '/spec/httpConfig/skipServerVerification',
  });
  if (values.httpConfig?.skipServerVerification) {
    if (httpConfig?.['ca.crt']) {
      patches.push({
        op: 'remove',
        path: '/spec/httpConfig/ca.crt',
      });
    }
  } else {
    const caCrt = values.httpConfig?.caCrt;
    appendJSONPatch({
      patches,
      newValue: caCrt ? btoa(caCrt) : caCrt,
      originalValue: httpConfig?.['ca.crt'],
      path: '/spec/httpConfig/ca.crt',
    });
  }

  if (!values.httpConfig?.basicAuth?.use) {
    if (httpConfig?.password) {
      patches.push({
        op: 'remove',
        path: '/spec/httpConfig/password',
      });
    }
    if (httpConfig?.username) {
      patches.push({
        op: 'remove',
        path: '/spec/httpConfig/username',
      });
    }
  } else {
    appendJSONPatch({
      patches,
      newValue: values.httpConfig?.basicAuth.password,
      originalValue: httpConfig?.password,
      path: '/spec/httpConfig/password',
    });
    appendJSONPatch({
      patches,
      newValue: values.httpConfig?.basicAuth.username,
      originalValue: httpConfig?.username,
      path: '/spec/httpConfig/username',
    });
  }

  if (!values.httpConfig?.mTlsAuth?.use) {
    if (httpConfig?.['tls.crt']) {
      patches.push({
        op: 'remove',
        path: '/spec/httpConfig/tls.crt',
      });
    }
    if (httpConfig?.['tls.key']) {
      patches.push({
        op: 'remove',
        path: '/spec/httpConfig/tls.key',
      });
    }
  } else {
    appendJSONPatch({
      patches,
      newValue: values.httpConfig?.mTlsAuth.tlsCrt,
      originalValue: httpConfig?.['tls.crt'],
      path: '/spec/httpConfig/tls.crt',
      encodeB64: true,
    });
    appendJSONPatch({
      patches,
      newValue: values.httpConfig?.mTlsAuth.tlsKey,
      originalValue: httpConfig?.['tls.key'],
      path: '/spec/httpConfig/tls.key',
      encodeB64: true,
    });
  }

  if (!values.httpConfig?.token) {
    if (httpConfig?.token) {
      patches.push({
        op: 'remove',
        path: '/spec/httpConfig/token',
      });
    }
  } else {
    appendJSONPatch({
      patches,
      newValue: values.httpConfig?.token,
      originalValue: httpConfig?.token,
      path: '/spec/httpConfig/token',
    });
  }
};

const getHttpRepositoryPatches = (values: RepositoryFormValues, repoSpec: HttpRepoSpec): PatchRequest => {
  const patches: PatchRequest = [];

  appendJSONPatch({
    patches,
    newValue: values.url,
    originalValue: repoSpec.url,
    path: '/spec/url',
  });

  if (!values.useAdvancedConfig) {
    if (repoSpec.validationSuffix) {
      patches.push({
        op: 'remove',
        path: '/spec/validationSuffix',
      });
    }
    patches.push({
      op: 'remove',
      path: '/spec/httpConfig',
    });
    return patches;
  }

  // The rest of the fields are part of advanced settings
  appendJSONPatch({
    patches,
    newValue: values.validationSuffix,
    originalValue: repoSpec.validationSuffix,
    path: '/spec/validationSuffix',
  });

  addHttpConfigPatches(patches, values, repoSpec.httpConfig);

  return patches;
};

const getOciRepositoryPatches = (values: RepositoryFormValues, repoSpec: OciRepoSpec): PatchRequest => {
  const formOciConfig = values.ociConfig;
  if (!formOciConfig) {
    return [];
  }

  const patches: PatchRequest = [];
  appendJSONPatch({
    patches,
    newValue: formOciConfig.registry,
    originalValue: repoSpec.registry,
    path: '/spec/registry',
  });
  appendJSONPatch({
    patches,
    newValue: formOciConfig.scheme || OciRepoSpec.scheme.HTTPS,
    originalValue: repoSpec.scheme,
    path: '/spec/scheme',
  });

  appendJSONPatch({
    patches,
    newValue: formOciConfig.accessMode || OciRepoSpec.accessMode.READ,
    originalValue: repoSpec.accessMode,
    path: '/spec/accessMode',
  });

  if (!values.useAdvancedConfig) {
    if (repoSpec.ociAuth) {
      patches.push({ op: 'remove', path: '/spec/ociAuth' });
    }
    if (repoSpec['ca.crt']) {
      patches.push({ op: 'remove', path: '/spec/ca.crt' });
    }
    if (repoSpec.skipServerVerification !== undefined) {
      patches.push({ op: 'remove', path: '/spec/skipServerVerification' });
    }
    return patches;
  }

  appendJSONPatch({
    patches,
    newValue: formOciConfig.skipServerVerification,
    originalValue: repoSpec.skipServerVerification,
    path: '/spec/skipServerVerification',
  });

  if (formOciConfig.skipServerVerification && repoSpec['ca.crt']) {
    patches.push({ op: 'remove', path: '/spec/ca.crt' });
  } else {
    const caCrt = formOciConfig.caCrt;
    appendJSONPatch({
      patches,
      newValue: caCrt ? btoa(caCrt) : caCrt,
      originalValue: repoSpec['ca.crt'],
      path: '/spec/ca.crt',
    });
  }

  const ociAuth = formOciConfig.ociAuth;
  if (ociAuth?.use && ociAuth.username && ociAuth.password) {
    if (!repoSpec.ociAuth) {
      const ociAuthValue: DockerAuth = {
        authType: OciAuthType.DOCKER,
        username: ociAuth.username,
        password: ociAuth.password,
      };
      patches.push({
        op: 'add',
        path: '/spec/ociAuth',
        value: ociAuthValue,
      });
    } else {
      if (ociAuth.username !== repoSpec.ociAuth.username) {
        appendJSONPatch({
          patches,
          newValue: ociAuth.username,
          originalValue: repoSpec.ociAuth.username,
          path: '/spec/ociAuth/username',
        });
      }

      if (ociAuth.password !== repoSpec.ociAuth.password) {
        appendJSONPatch({
          patches,
          newValue: ociAuth.password,
          originalValue: repoSpec.ociAuth.password,
          path: '/spec/ociAuth/password',
        });
      }
    }
  } else if (repoSpec.ociAuth) {
    patches.push({ op: 'remove', path: '/spec/ociAuth' });
  }
  return patches;
};

const getGitRepositoryPatches = (values: RepositoryFormValues, gitRepoSpec: GitRepoSpec): PatchRequest => {
  const patches: PatchRequest = [];

  appendJSONPatch({
    patches,
    newValue: values.url,
    originalValue: gitRepoSpec.url,
    path: '/spec/url',
  });

  if (!values.useAdvancedConfig) {
    if (gitRepoSpec.httpConfig) {
      patches.push({
        op: 'remove',
        path: '/spec/httpConfig',
      });
    }
    if (gitRepoSpec.sshConfig) {
      patches.push({
        op: 'remove',
        path: '/spec/sshConfig',
      });
    }
    return patches;
  }

  // Determine which config is being used based on form values (configType)
  const usingHttpConfig = values.configType === 'http';
  const usingSshConfig = values.configType === 'ssh';

  if (usingHttpConfig) {
    // Switching from SSH to HTTP or editing HTTP config
    if (gitRepoSpec.sshConfig) {
      patches.push({
        op: 'remove',
        path: '/spec/sshConfig',
      });
    }

    addHttpConfigPatches(patches, values, gitRepoSpec.httpConfig);
  } else if (usingSshConfig) {
    // Switching from HTTP to SSH or editing SSH config
    if (gitRepoSpec.httpConfig) {
      patches.push({
        op: 'remove',
        path: '/spec/httpConfig',
      });
    }

    const sshConfig = gitRepoSpec.sshConfig;
    // If sshConfig doesn't exist, create it as a whole object
    if (!sshConfig) {
      const value: SshConfig = {
        privateKeyPassphrase: values.sshConfig?.privateKeyPassphrase,
        skipServerVerification: values.sshConfig?.skipServerVerification,
      };
      if (values.sshConfig?.sshPrivateKey) {
        value.sshPrivateKey = btoa(values.sshConfig.sshPrivateKey);
      }

      patches.push({
        op: 'add',
        path: '/spec/sshConfig',
        value,
      });
    } else {
      // sshConfig exists, patch individual properties
      appendJSONPatch({
        patches,
        newValue: values.sshConfig?.privateKeyPassphrase,
        originalValue: sshConfig?.privateKeyPassphrase,
        path: '/spec/sshConfig/privateKeyPassphrase',
      });

      appendJSONPatch({
        patches,
        newValue: values.sshConfig?.skipServerVerification,
        originalValue: sshConfig?.skipServerVerification,
        path: '/spec/sshConfig/skipServerVerification',
      });

      appendJSONPatch({
        patches,
        newValue: values.sshConfig?.sshPrivateKey,
        originalValue: sshConfig?.sshPrivateKey,
        path: '/spec/sshConfig/sshPrivateKey',
        encodeB64: true,
      });
    }
  }
  return patches;
};

/**
 * Converts HttpConfig from the repository spec to form values format
 */
export const httpConfigToFormValues = (httpConfig?: HttpConfig): RepositoryFormValues['httpConfig'] => {
  if (!httpConfig) {
    return undefined;
  }

  return {
    caCrt: httpConfig['ca.crt'] ? atob(httpConfig['ca.crt']) : undefined,
    basicAuth: {
      username: httpConfig.username,
      password: httpConfig.password,
      use: !!httpConfig.username || !!httpConfig.password,
    },
    mTlsAuth: {
      tlsCrt: httpConfig['tls.crt'],
      tlsKey: httpConfig['tls.key'],
      use: !!httpConfig['tls.crt'] || !!httpConfig['tls.key'],
    },
    skipServerVerification: httpConfig.skipServerVerification,
    token: httpConfig.token,
  };
};

export const getRepoUrlOrRegistry = (repoSpec: RepositorySpec): string => {
  if (repoSpec.type === RepoSpecType.RepoSpecTypeOci) {
    return repoSpec.registry || '';
  }
  return repoSpec.url || '';
};

export const getRepoTypeLabel = (t: TFunction, repoType: RepositorySpec['type']): string => {
  switch (repoType) {
    case RepoSpecType.RepoSpecTypeHttp:
      return t('HTTP service');
    case RepoSpecType.RepoSpecTypeOci:
      return t('OCI registry');
    default:
      return t('Git repository');
  }
};

export const getInitValues = ({
  repository,
  resourceSyncs,
  options,
}: {
  repository?: Repository;
  resourceSyncs?: ResourceSync[];
  options?: {
    canUseResourceSyncs?: boolean;
    allowedRepoTypes?: RepoSpecType[];
    showRepoTypes?: boolean;
  };
}): RepositoryFormValues => {
  const configAllowsResourceSyncs = options?.canUseResourceSyncs ?? true;

  if (!repository) {
    const selectedRepoType =
      options?.allowedRepoTypes?.length === 1 ? options.allowedRepoTypes[0] : RepoSpecType.RepoSpecTypeGit;
    const canUseRSs = selectedRepoType === RepoSpecType.RepoSpecTypeGit && configAllowsResourceSyncs;

    const initValues: RepositoryFormValues = {
      exists: false,
      repoType: selectedRepoType,
      allowedRepoTypes: options?.allowedRepoTypes,
      showRepoTypes: options?.showRepoTypes ?? true,
      name: '',
      url: '',
      useAdvancedConfig: false,
      configType: 'http',
      canUseResourceSyncs: canUseRSs,
      useResourceSyncs: canUseRSs,
      resourceSyncs: [
        {
          name: '',
          path: '',
          targetRevision: '',
        },
      ],
    };

    if (selectedRepoType === RepoSpecType.RepoSpecTypeOci) {
      initValues.ociConfig = {
        registry: '',
        scheme: OciRepoSpec.scheme.HTTPS,
        accessMode: OciRepoSpec.accessMode.READ,
      };
    }

    return initValues;
  }

  const canUseRSs = repository.spec.type === RepoSpecType.RepoSpecTypeGit && configAllowsResourceSyncs;

  const formValues: RepositoryFormValues = {
    exists: true,
    name: repository.metadata.name || '',
    url: repository.spec.type === RepoSpecType.RepoSpecTypeOci ? '' : repository.spec.url || '',
    repoType: repository.spec.type as RepoSpecType,
    validationSuffix: 'validationSuffix' in repository.spec ? repository.spec.validationSuffix : '',
    allowedRepoTypes: options?.allowedRepoTypes,
    showRepoTypes: options?.showRepoTypes ?? true,
    useAdvancedConfig: false,
    configType: 'http',
    canUseResourceSyncs: canUseRSs,
    useResourceSyncs: canUseRSs && !!resourceSyncs?.length,
    resourceSyncs: resourceSyncs?.length
      ? resourceSyncs
          .filter((rs) => rs.spec.repository === repository.metadata.name)
          .map((rs) => ({
            name: rs.metadata.name || '',
            path: rs.spec.path || '',
            targetRevision: rs.spec.targetRevision || '',
            exists: true,
          }))
      : [{ name: '', path: '', targetRevision: '' }],
  };

  if (repository.spec.type === RepoSpecType.RepoSpecTypeOci) {
    formValues.useAdvancedConfig = !!(
      repository.spec.ociAuth ||
      repository.spec['ca.crt'] ||
      repository.spec.skipServerVerification
    );
    formValues.ociConfig = {
      registry: repository.spec.registry,
      scheme: repository.spec.scheme || OciRepoSpec.scheme.HTTPS,
      accessMode: repository.spec.accessMode || OciRepoSpec.accessMode.READ,
      ociAuth: repository.spec.ociAuth
        ? {
            use: true,
            username: repository.spec.ociAuth.username,
            password: repository.spec.ociAuth.password,
          }
        : undefined,
      caCrt: repository.spec['ca.crt'] ? atob(repository.spec['ca.crt']) : undefined,
      skipServerVerification: repository.spec.skipServerVerification,
    };
  } else if (repository.spec.type === RepoSpecType.RepoSpecTypeHttp) {
    formValues.configType = 'http';
    formValues.validationSuffix = repository.spec.validationSuffix;

    const valuesHttpConfig = httpConfigToFormValues(repository.spec.httpConfig);
    if (valuesHttpConfig) {
      formValues.httpConfig = valuesHttpConfig;
    }
    formValues.useAdvancedConfig = !!formValues.httpConfig || !!formValues.validationSuffix;
  } else if (repository.spec.type === RepoSpecType.RepoSpecTypeGit) {
    const gitRepoSpec = repository.spec;
    if (gitRepoSpec.httpConfig) {
      formValues.configType = 'http';
      formValues.useAdvancedConfig = true;
      formValues.httpConfig = httpConfigToFormValues(gitRepoSpec.httpConfig);
    } else if (gitRepoSpec.sshConfig) {
      formValues.configType = 'ssh';
      formValues.useAdvancedConfig = true;
      formValues.sshConfig = {
        privateKeyPassphrase: gitRepoSpec.sshConfig.privateKeyPassphrase,
        skipServerVerification: gitRepoSpec.sshConfig.skipServerVerification,
        sshPrivateKey: gitRepoSpec.sshConfig.sshPrivateKey,
      };
    }
  }

  return formValues;
};

export const getRepositoryPatches = (values: RepositoryFormValues, repository: Repository): PatchRequest => {
  // If repoType changes, replace the entire spec
  if (values.repoType !== repository.spec.type) {
    const newRepository = getRepository(values);
    return [
      {
        op: 'replace',
        path: '/spec',
        value: newRepository.spec,
      },
    ];
  }

  // Otherwise, we have the same type of repository, and we must patch only the fields that changed
  if (values.repoType === RepoSpecType.RepoSpecTypeOci) {
    return getOciRepositoryPatches(values, repository.spec as OciRepoSpec);
  }

  if (values.repoType === RepoSpecType.RepoSpecTypeHttp) {
    return getHttpRepositoryPatches(values, repository.spec as HttpRepoSpec);
  }

  if (values.repoType === RepoSpecType.RepoSpecTypeGit) {
    return getGitRepositoryPatches(values, repository.spec as GitRepoSpec);
  }

  return [];
};

export const getResourceSyncEditPatch = (rs: ResourceSyncFormValue) => {
  // The patch is always an edition because adding / deleting RS can only be done via POST / DELETE api calls.
  return [
    {
      op: 'replace',
      path: '/spec/path',
      value: rs.path,
    },
    {
      op: 'replace',
      path: '/spec/targetRevision',
      value: rs.targetRevision,
    },
  ] as PatchRequest;
};

export const repoSyncSchema = (t: TFunction, values: ResourceSyncFormValue[]) => {
  return Yup.array()
    .of(
      Yup.object().shape({
        name: validKubernetesDnsSubdomain(t, { isRequired: true }).test(
          'unique name',
          (value: string | undefined, testContext) => {
            const hasError = value && values.filter((v) => v.name === value).length !== 1;
            return hasError
              ? testContext.createError({
                  message: {
                    duplicateName: 'failed',
                  },
                })
              : true;
          },
        ),
        targetRevision: maxLengthString(t, {
          maxLength: MAX_TARGET_REVISION_LENGTH,
          fieldName: t('Target revision'),
        }).defined(t('Target revision is required.')),
        path: maxLengthString(t, { maxLength: MAX_PATH_LENGTH, fieldName: t('Path') })
          .matches(pathRegex, t('Must be an absolute path.'))
          .defined(t('Path is required.')),
      }),
    )
    .required();
};

export type SingleResourceSyncValues = { resourceSyncs: ResourceSyncFormValue[] };

export const singleResourceSyncSchema = (t: TFunction, existingRSs: ResourceSync[]) => {
  return Yup.lazy((values: SingleResourceSyncValues) => {
    // We combine the existing RSs with the one being created, to validate that the new name is unique
    const combinedRSs = values.resourceSyncs.concat(
      existingRSs.map(
        (rs) =>
          ({
            name: rs.metadata.name, // Only the name is relevant
            path: '',
            targetRevision: '',
          }) as ResourceSyncFormValue,
      ),
    );

    return Yup.object({
      resourceSyncs: repoSyncSchema(t, combinedRSs),
    });
  });
};

// Regex for registry hostname: FQDN, IP address (IPv4 or IPv6), with optional port, matching as much as possible of the backend pattern
const registryHostnameRegex =
  /^(([a-z0-9]([-a-z0-9]*[a-z0-9])?\.)*[a-z]([-a-z0-9]*[a-z0-9])?|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|\[[a-fA-F0-9:]+\])(:[0-9]{1,5})?$/;

export const repositorySchema =
  (t: TFunction, repository: Repository | undefined) => (values: RepositoryFormValues) => {
    const baseSchema = {
      name: validKubernetesDnsSubdomain(t, { isRequired: !repository }),
      configType: values.useAdvancedConfig ? Yup.string().required(t('Repository type is required')) : Yup.string(),
      httpConfig: Yup.object({
        basicAuth: Yup.object({
          username: values.httpConfig?.basicAuth?.use ? Yup.string().required(t('Username is required')) : Yup.string(),
          password: values.httpConfig?.basicAuth?.use ? Yup.string().required(t('Password is required')) : Yup.string(),
        }),
        mTlsAuth: Yup.object({
          tlsCrt: values.httpConfig?.mTlsAuth?.use
            ? Yup.string().required(t('Client TLS certificate is required'))
            : Yup.string(),
          tlsKey: values.httpConfig?.mTlsAuth?.use
            ? Yup.string().required(t('Client TLS key is required'))
            : Yup.string(),
        }),
        token: Yup.string().matches(jwtTokenRegexp, t('Must be a valid JWT token')),
      }),
      useResourceSyncs: Yup.boolean(),
      resourceSyncs: values.useResourceSyncs ? repoSyncSchema(t, values.resourceSyncs) : Yup.array(),
    };

    if (values.repoType === RepoSpecType.RepoSpecTypeOci) {
      return Yup.object({
        ...baseSchema,
        url: Yup.string(),
        ociConfig: Yup.object({
          registry: Yup.string()
            .matches(
              registryHostnameRegex,
              t('Enter a valid registry hostname (e.g., quay.io, registry.redhat.io, myregistry.com:5000)'),
            )
            .required(t('Registry hostname is required')),
          scheme: Yup.string().oneOf([OciRepoSpec.scheme.HTTP, OciRepoSpec.scheme.HTTPS]),
          accessMode: Yup.string().oneOf([OciRepoSpec.accessMode.READ, OciRepoSpec.accessMode.READ_WRITE]),
          ociAuth: Yup.object({
            use: Yup.boolean(),
            username: values.ociConfig?.ociAuth?.use ? Yup.string().required(t('Username is required')) : Yup.string(),
            password: values.ociConfig?.ociAuth?.use ? Yup.string().required(t('Password is required')) : Yup.string(),
          }),
          caCrt: Yup.string(),
          skipServerVerification: Yup.boolean(),
        }),
      });
    }

    return Yup.object({
      ...baseSchema,
      url: Yup.string().when('repoType', {
        is: (repoType: RepoSpecType) => repoType === RepoSpecType.RepoSpecTypeGit,
        then: () =>
          Yup.string()
            .matches(
              gitRepoUrlRegex,
              t('Enter a valid repository URL. Example: {{ demoRepositoryUrl }}', {
                demoRepositoryUrl: 'https://github.com/flightctl/flightctl-demos',
              }),
            )
            .defined(t('Repository URL is required')),
        otherwise: () =>
          Yup.string()
            .matches(httpRepoUrlRegex, t('Enter a valid HTTP service URL. Example: https://my-service-url'))
            .defined(t('HTTP service URL is required')),
      }),
      ociConfig: Yup.object(),
    });
  };

export const getRepository = (values: Omit<RepositoryFormValues, 'useResourceSyncs' | 'resourceSyncs'>): Repository => {
  if (values.repoType === RepoSpecType.RepoSpecTypeOci && values.ociConfig) {
    const ociRepoSpec: OciRepoSpec = {
      registry: values.ociConfig.registry,
      type: RepoSpecType.RepoSpecTypeOci,
      scheme: values.ociConfig.scheme || OciRepoSpec.scheme.HTTPS,
      accessMode: values.ociConfig.accessMode || OciRepoSpec.accessMode.READ,
    };

    if (values.ociConfig.skipServerVerification) {
      ociRepoSpec.skipServerVerification = true;
    }

    if (values.ociConfig.caCrt && !values.ociConfig.skipServerVerification) {
      ociRepoSpec['ca.crt'] = btoa(values.ociConfig.caCrt);
    }

    if (values.ociConfig.ociAuth?.use && values.ociConfig.ociAuth.username && values.ociConfig.ociAuth.password) {
      ociRepoSpec.ociAuth = {
        authType: OciAuthType.DOCKER,
        username: values.ociConfig.ociAuth.username,
        password: values.ociConfig.ociAuth.password,
      };
    }

    return {
      apiVersion: ApiVersion.ApiVersionV1beta1,
      kind: 'Repository',
      metadata: {
        name: values.name,
      },
      spec: ociRepoSpec,
    };
  }

  let spec: GitRepoSpec | HttpRepoSpec;

  if (values.repoType === RepoSpecType.RepoSpecTypeGit) {
    spec = {
      url: values.url,
      type: RepoSpecType.RepoSpecTypeGit,
    };
  } else {
    spec = {
      url: values.url,
      type: RepoSpecType.RepoSpecTypeHttp,
    };
  }

  // Handle config based on repository type
  if (spec.type === RepoSpecType.RepoSpecTypeHttp) {
    if (values.validationSuffix) {
      spec.httpConfig = {
        skipServerVerification: false,
      };
      spec.validationSuffix = values.validationSuffix;
    }

    if (values.httpConfig) {
      spec.httpConfig = {
        skipServerVerification: values.httpConfig.skipServerVerification,
      };
      const caCrt = values.httpConfig.caCrt;
      if (caCrt && !values.httpConfig.skipServerVerification) {
        spec.httpConfig['ca.crt'] = btoa(caCrt);
      }
      if (values.httpConfig.basicAuth?.use) {
        spec.httpConfig.username = values.httpConfig.basicAuth.username;
        spec.httpConfig.password = values.httpConfig.basicAuth.password;
      }

      if (values.httpConfig.mTlsAuth?.use) {
        const tlsCrt = values.httpConfig.mTlsAuth.tlsCrt;
        if (tlsCrt) {
          spec.httpConfig['tls.crt'] = btoa(tlsCrt);
        }
        const tlsKey = values.httpConfig.mTlsAuth.tlsKey;
        if (tlsKey) {
          spec.httpConfig['tls.key'] = btoa(tlsKey);
        }
      }
      if (values.httpConfig.token) {
        spec.httpConfig.token = values.httpConfig.token;
      }
    }
  } else if (spec.type === RepoSpecType.RepoSpecTypeGit) {
    if (values.configType === 'http' && values.httpConfig) {
      spec.httpConfig = {
        skipServerVerification: values.httpConfig.skipServerVerification,
      };
      const caCrt = values.httpConfig.caCrt;
      if (caCrt && !values.httpConfig.skipServerVerification) {
        spec.httpConfig['ca.crt'] = btoa(caCrt);
      }
      if (values.httpConfig.basicAuth?.use) {
        spec.httpConfig.username = values.httpConfig.basicAuth.username;
        spec.httpConfig.password = values.httpConfig.basicAuth.password;
      }

      if (values.httpConfig.mTlsAuth?.use) {
        const tlsCrt = values.httpConfig.mTlsAuth.tlsCrt;
        if (tlsCrt) {
          spec.httpConfig['tls.crt'] = btoa(tlsCrt);
        }
        const tlsKey = values.httpConfig.mTlsAuth.tlsKey;
        if (tlsKey) {
          spec.httpConfig['tls.key'] = btoa(tlsKey);
        }
      }
      // Note: GitRepoSpec doesn't support token
    } else if (values.configType === 'ssh' && values.sshConfig) {
      spec.sshConfig = {
        privateKeyPassphrase: values.sshConfig.privateKeyPassphrase,
        skipServerVerification: values.sshConfig.skipServerVerification,
      };

      const sshPrivateKey = values.sshConfig.sshPrivateKey;
      if (sshPrivateKey) {
        spec.sshConfig.sshPrivateKey = btoa(sshPrivateKey);
      }
    }
  }

  return {
    apiVersion: ApiVersion.ApiVersionV1beta1,
    kind: 'Repository',
    metadata: {
      name: values.name,
    },
    spec,
  };
};

export const getResourceSync = (repositoryId: string, values: ResourceSyncFormValue): ResourceSync => {
  return {
    apiVersion: ApiVersion.ApiVersionV1beta1,
    kind: 'ResourceSync',
    metadata: {
      name: values.name,
    },
    spec: {
      repository: repositoryId,
      targetRevision: values.targetRevision,
      path: values.path,
    },
  };
};

export const handlePromises = async (promises: Promise<unknown>[]): Promise<string[]> => {
  const results = await Promise.allSettled(promises);
  const failedPromises = results.filter((r) => r.status === 'rejected');
  return failedPromises.map((fp) => getErrorMessage(fp.reason));
};
