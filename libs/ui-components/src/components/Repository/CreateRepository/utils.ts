import * as Yup from 'yup';
import { TFunction } from 'i18next';
import {
  HttpConfig,
  HttpRepoSpec,
  PatchRequest,
  RepoSpecType,
  Repository,
  RepositorySpec,
  ResourceSync,
  SshConfig,
  SshRepoSpec,
} from '@flightctl/types';

import { RepositoryFormValues, ResourceSyncFormValue } from './types';
import { API_VERSION } from '../../../constants';
import { getErrorMessage } from '../../../utils/error';
import { appendJSONPatch } from '../../../utils/patch';
import { MAX_TARGET_REVISION_LENGTH, maxLengthString, validKubernetesDnsSubdomain } from '../../form/validations';

const MAX_PATH_LENGTH = 2048;
const gitRepoUrlRegex = new RegExp(
  /^((http|git|ssh|http(s)|file|\/?)|(git@[\w.]+))(:(\/\/)?)([\w.@:/\-~]+)(\.git)?(\/)?$/,
);
const httpRepoUrlRegex = /^(http|https)/;
const pathRegex = /\/.+/;
const jwtTokenRegexp = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;

export const isHttpRepoSpec = (repoSpec: RepositorySpec): repoSpec is HttpRepoSpec =>
  !!(repoSpec['httpConfig'] || (repoSpec as HttpRepoSpec).validationSuffix);
export const isSshRepoSpec = (repoSpec: RepositorySpec): repoSpec is SshRepoSpec => !!repoSpec['sshConfig'];

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
  const useRSs = options?.canUseResourceSyncs ?? true;

  if (!repository) {
    const selectedRepoType = options?.allowedRepoTypes?.length === 1 ? options.allowedRepoTypes[0] : RepoSpecType.GIT;

    return {
      exists: false,
      repoType: selectedRepoType,
      allowedRepoTypes: options?.allowedRepoTypes,
      showRepoTypes: options?.showRepoTypes ?? true,
      name: '',
      url: '',
      useAdvancedConfig: false,
      configType: 'http',

      canUseResourceSyncs: useRSs,
      useResourceSyncs: useRSs,
      resourceSyncs: [
        {
          name: '',
          path: '',
          targetRevision: '',
        },
      ],
    };
  }

  const formValues: RepositoryFormValues = {
    exists: true,
    name: repository.metadata.name || '',
    url: repository.spec.url || '',
    repoType: repository.spec.type,
    validationSuffix: 'validationSuffix' in repository.spec ? repository.spec.validationSuffix : '',
    allowedRepoTypes: options?.allowedRepoTypes,
    showRepoTypes: options?.showRepoTypes ?? true,
    useResourceSyncs: !!resourceSyncs?.length,
    useAdvancedConfig: false,
    configType: 'http',
    canUseResourceSyncs: useRSs,
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

  if (isHttpRepoSpec(repository.spec)) {
    formValues.useAdvancedConfig = true;
    formValues.configType = 'http';
    formValues.httpConfig = {
      caCrt: repository.spec.httpConfig['ca.crt'] ? atob(repository.spec.httpConfig['ca.crt']) : undefined,
      basicAuth: {
        username: repository.spec.httpConfig.username,
        password: repository.spec.httpConfig.password,
        use: !!repository.spec.httpConfig.username || !!repository.spec.httpConfig.password,
      },
      mTlsAuth: {
        tlsCrt: repository.spec.httpConfig['tls.crt'],
        tlsKey: repository.spec.httpConfig['tls.key'],
        use: !!repository.spec.httpConfig['tls.crt'] || !!repository.spec.httpConfig['tls.key'],
      },
      skipServerVerification: repository.spec.httpConfig.skipServerVerification,
      token: repository.spec.httpConfig.token,
    };
  } else if (isSshRepoSpec(repository.spec)) {
    formValues.useAdvancedConfig = true;
    formValues.configType = 'ssh';
    formValues.sshConfig = {
      privateKeyPassphrase: repository.spec.sshConfig.privateKeyPassphrase,
      skipServerVerification: repository.spec.sshConfig.skipServerVerification,
      sshPrivateKey: repository.spec.sshConfig.sshPrivateKey,
    };
  }

  return formValues;
};

export const getRepositoryPatches = (values: RepositoryFormValues, repository: Repository): PatchRequest => {
  const patches: PatchRequest = [];
  appendJSONPatch({
    patches,
    newValue: values.repoType,
    originalValue: repository.spec.type,
    path: '/spec/type',
  });
  appendJSONPatch({
    patches,
    newValue: values.url,
    originalValue: repository.spec.url,
    path: '/spec/url',
  });

  if (!values.useAdvancedConfig) {
    if (isHttpRepoSpec(repository.spec)) {
      patches.push({
        op: 'remove',
        path: '/spec/httpConfig',
      });
      patches.push({
        op: 'remove',
        path: '/spec/validationSuffix',
      });
    }
    if (isSshRepoSpec(repository.spec)) {
      patches.push({
        op: 'remove',
        path: '/spec/sshConfig',
      });
    }
    return patches;
  }

  if (values.configType === 'http') {
    if (isSshRepoSpec(repository.spec)) {
      patches.push({
        op: 'remove',
        path: '/spec/sshConfig',
      });
    }
    if (!isHttpRepoSpec(repository.spec)) {
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
      appendJSONPatch({
        patches,
        newValue: values.validationSuffix,
        originalValue: undefined,
        path: '/spec/validationSuffix',
      });
    } else {
      appendJSONPatch({
        patches,
        newValue: values.repoType === RepoSpecType.HTTP ? values.validationSuffix : undefined,
        originalValue: repository.spec.validationSuffix,
        path: '/spec/validationSuffix',
      });

      appendJSONPatch({
        patches,
        newValue: values.httpConfig?.skipServerVerification,
        originalValue: repository.spec.httpConfig.skipServerVerification,
        path: '/spec/httpConfig/skipServerVerification',
      });
      if (values.httpConfig?.skipServerVerification) {
        if (repository.spec.httpConfig['ca.crt']) {
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
          originalValue: repository.spec.httpConfig['ca.crt'],
          path: '/spec/httpConfig/ca.crt',
        });
      }

      if (!values.httpConfig?.basicAuth?.use) {
        if (repository.spec.httpConfig.password) {
          patches.push({
            op: 'remove',
            path: '/spec/httpConfig/password',
          });
        }
        if (repository.spec.httpConfig.username) {
          patches.push({
            op: 'remove',
            path: '/spec/httpConfig/username',
          });
        }
      } else {
        appendJSONPatch({
          patches,
          newValue: values.httpConfig?.basicAuth.password,
          originalValue: repository.spec.httpConfig.password,
          path: '/spec/httpConfig/password',
        });
        appendJSONPatch({
          patches,
          newValue: values.httpConfig?.basicAuth.username,
          originalValue: repository.spec.httpConfig.username,
          path: '/spec/httpConfig/username',
        });
      }

      if (!values.httpConfig?.mTlsAuth?.use) {
        if (repository.spec.httpConfig['tls.crt']) {
          patches.push({
            op: 'remove',
            path: '/spec/httpConfig/tls.crt',
          });
        }
        if (repository.spec.httpConfig['tls.key']) {
          patches.push({
            op: 'remove',
            path: '/spec/httpConfig/tls.key',
          });
        }
      } else {
        appendJSONPatch({
          patches,
          newValue: values.httpConfig?.mTlsAuth.tlsCrt,
          originalValue: repository.spec.httpConfig['tls.crt'],
          path: '/spec/httpConfig/tls.crt',
          encodeB64: true,
        });
        appendJSONPatch({
          patches,
          newValue: values.httpConfig?.mTlsAuth.tlsKey,
          originalValue: repository.spec.httpConfig['tls.key'],
          path: '/spec/httpConfig/tls.key',
          encodeB64: true,
        });
      }

      if (!values.httpConfig?.token) {
        if (repository.spec.httpConfig.token) {
          patches.push({
            op: 'remove',
            path: '/spec/httpConfig/token',
          });
        }
      } else {
        appendJSONPatch({
          patches,
          newValue: values.httpConfig?.token,
          originalValue: repository.spec.httpConfig.token,
          path: '/spec/httpConfig/token',
        });
      }
    }
  } else if (values.configType === 'ssh') {
    if (isHttpRepoSpec(repository.spec)) {
      patches.push({
        op: 'remove',
        path: '/spec/httpConfig',
      });
      if (repository.spec.validationSuffix) {
        patches.push({
          op: 'remove',
          path: '/spec/validationSuffix',
        });
      }
    }
    if (!isSshRepoSpec(repository.spec)) {
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
      appendJSONPatch({
        patches,
        newValue: values.sshConfig?.privateKeyPassphrase,
        originalValue: repository.spec.sshConfig.privateKeyPassphrase,
        path: '/spec/sshConfig/privateKeyPassphrase',
      });

      appendJSONPatch({
        patches,
        newValue: values.sshConfig?.skipServerVerification,
        originalValue: repository.spec.sshConfig.skipServerVerification,
        path: '/spec/sshConfig/skipServerVerification',
      });

      appendJSONPatch({
        patches,
        newValue: values.sshConfig?.sshPrivateKey,
        originalValue: repository.spec.sshConfig.sshPrivateKey,
        path: '/spec/sshConfig/sshPrivateKey',
        encodeB64: true,
      });
    }
  }

  return patches;
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

export const repositorySchema =
  (t: TFunction, repository: Repository | undefined) => (values: RepositoryFormValues) => {
    return Yup.object({
      name: validKubernetesDnsSubdomain(t, { isRequired: !repository }),
      url: Yup.string().when('repoType', {
        is: (repoType: RepoSpecType) => repoType === RepoSpecType.GIT,
        then: () =>
          Yup.string()
            .matches(
              gitRepoUrlRegex,
              t('Enter a valid repository URL. Example: https://github.com/flightctl/flightctl-demos'),
            )
            .defined(t('Repository URL is required')),
        otherwise: () =>
          Yup.string()
            .matches(httpRepoUrlRegex, t('Enter a valid HTTP service URL. Example: https://my-service-url'))
            .defined(t('HTTP service URL is required')),
      }),
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
    });
  };

export const getRepository = (values: Omit<RepositoryFormValues, 'useResourceSyncs' | 'resourceSyncs'>): Repository => {
  const spec: RepositorySpec = {
    url: values.url,
    type: values.repoType,
  };
  if (values.configType === 'http' && values.validationSuffix) {
    const httpRepoSpec = spec as HttpRepoSpec;
    httpRepoSpec.validationSuffix = values.validationSuffix;
    // httpConfig must be included as "validationSuffix" is only allowed for HttpRepoSpec
    httpRepoSpec.httpConfig = {
      skipServerVerification: false,
    };
  }

  if (values.configType === 'http' && values.httpConfig) {
    const httpRepoSpec = spec as HttpRepoSpec;
    httpRepoSpec.httpConfig = {
      skipServerVerification: values.httpConfig.skipServerVerification,
    };
    const caCrt = values.httpConfig.caCrt;
    if (caCrt && !values.httpConfig.skipServerVerification) {
      httpRepoSpec.httpConfig['ca.crt'] = btoa(caCrt);
    }
    if (values.httpConfig.basicAuth?.use) {
      httpRepoSpec.httpConfig.username = values.httpConfig.basicAuth.username;
      httpRepoSpec.httpConfig.password = values.httpConfig.basicAuth.password;
    }

    if (values.httpConfig.mTlsAuth?.use) {
      const tlsCrt = values.httpConfig.mTlsAuth.tlsCrt;
      if (tlsCrt) {
        httpRepoSpec.httpConfig['tls.crt'] = btoa(tlsCrt);
      }
      const tlsKey = values.httpConfig.mTlsAuth.tlsKey;
      if (tlsKey) {
        httpRepoSpec.httpConfig['tls.key'] = btoa(tlsKey);
      }
    }
    if (spec.type === RepoSpecType.HTTP && values.httpConfig.token) {
      httpRepoSpec.httpConfig.token = values.httpConfig.token;
    }
  } else if (values.configType === 'ssh' && values.sshConfig) {
    const sshRepoSpec = spec as SshRepoSpec;

    sshRepoSpec.sshConfig = {
      privateKeyPassphrase: values.sshConfig.privateKeyPassphrase,
      skipServerVerification: values.sshConfig.skipServerVerification,
    };

    const sshPrivateKey = values.sshConfig.sshPrivateKey;
    if (sshPrivateKey) {
      sshRepoSpec.sshConfig.sshPrivateKey = btoa(sshPrivateKey);
    }
  }

  return {
    apiVersion: API_VERSION,
    kind: 'Repository',
    metadata: {
      name: values.name,
    },
    spec,
  };
};

export const getResourceSync = (repositoryId: string, values: ResourceSyncFormValue): ResourceSync => {
  return {
    apiVersion: API_VERSION,
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
  const failedPromises = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
  return failedPromises.map((fp) => getErrorMessage(fp.reason));
};
