import {
  GitHttpConfig,
  GitHttpRepoSpec,
  GitSshConfig,
  GitSshRepoSpec,
  Repository,
  RepositorySpec,
  ResourceSync,
} from '@flightctl/types';
import { RepositoryFormValues, ResourceSyncFormValue } from './types';
import { API_VERSION } from '../../../constants';
import { getErrorMessage } from '../../../utils/error';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { isHttpRepoSpec, isSshRepoSpec } from '../../../types/extraTypes';
import { JSONPatch } from '../../../hooks/useAppContext';
import { appendJSONPatch } from '../../../utils/patch';

export const getInitValues = (
  repository?: Repository,
  resourceSyncs?: ResourceSync[],
  hideResourceSyncs?: boolean,
): RepositoryFormValues => {
  if (!repository) {
    return {
      exists: false,
      name: '',
      url: '',
      useAdvancedConfig: false,
      configType: 'http',
      useResourceSyncs: !hideResourceSyncs,
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
    url: repository.spec.repo || '',
    useResourceSyncs: !!resourceSyncs?.length,
    useAdvancedConfig: false,
    configType: 'http',
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

export const getRepositoryPatches = (values: RepositoryFormValues, repository: Repository): JSONPatch[] => {
  const patches: JSONPatch[] = [];
  appendJSONPatch({
    patches,
    newValue: values.url,
    originalValue: repository.spec.repo,
    path: '/spec/repo',
  });

  if (!values.useAdvancedConfig) {
    if (isHttpRepoSpec(repository.spec)) {
      patches.push({
        op: 'remove',
        path: '/spec/httpConfig',
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
      const value: GitHttpConfig = {
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
      patches.push({
        op: 'add',
        path: '/spec/httpConfig',
        value,
      });
    } else {
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
    }
  } else if (values.configType === 'ssh') {
    if (isHttpRepoSpec(repository.spec)) {
      patches.push({
        op: 'remove',
        path: '/spec/httpConfig',
      });
    }
    if (!isSshRepoSpec(repository.spec)) {
      const value: GitSshConfig = {
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

const gitRegex = new RegExp(/^((http|git|ssh|http(s)|file|\/?)|(git@[\w.]+))(:(\/\/)?)([\w.@:/\-~]+)(\.git)?(\/)?$/);
const repoNameRegex = /^[a-zA-Z0-9-_\\.]+$/;
const pathRegex = /\/.+/;

export const repoSyncSchema = (t: TFunction, values: ResourceSyncFormValue[]) => {
  return Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string()
          .defined(t('Name is required.'))
          .test('Must be unique', t('Must be unique'), (value) => {
            if (!value) {
              return true;
            }
            return values.filter((v) => v.name === value).length === 1;
          }),
        targetRevision: Yup.string().defined(t('Target revision is required.')),
        path: Yup.string().matches(pathRegex, t('Must be an absolute path.')).defined(t('Path is required.')),
      }),
    )
    .required();
};

export const repositorySchema =
  (t: TFunction, repository: Repository | undefined) => (values: RepositoryFormValues) => {
    return Yup.object({
      name: repository
        ? Yup.string()
        : Yup.string()
            .defined(t('Name is required'))
            .matches(repoNameRegex, t('Name can only contain alphanumeric characters, and the characters ., -, and _.'))
            .max(255, t('Name must not exceed 255 characters')),
      url: Yup.string()
        .matches(gitRegex, t('Enter a valid repository URL. Example: https://github.com/flightctl/flightctl-demos'))
        .defined(t('Repository URL is required')),
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
      }),
      useResourceSyncs: Yup.boolean(),
      resourceSyncs: values.useResourceSyncs ? repoSyncSchema(t, values.resourceSyncs) : Yup.array(),
    });
  };

export const getRepository = (values: Omit<RepositoryFormValues, 'useResourceSyncs' | 'resourceSyncs'>): Repository => {
  const spec: RepositorySpec = {
    repo: values.url,
  };
  if (values.configType === 'http' && values.httpConfig) {
    (spec as GitHttpRepoSpec).httpConfig = {
      skipServerVerification: values.httpConfig.skipServerVerification,
    };
    const caCrt = values.httpConfig.caCrt;
    if (caCrt && !values.httpConfig.skipServerVerification) {
      (spec as GitHttpRepoSpec).httpConfig['ca.crt'] = btoa(caCrt);
    }
    if (values.httpConfig.basicAuth?.use) {
      (spec as GitHttpRepoSpec).httpConfig.username = values.httpConfig.basicAuth.username;
      (spec as GitHttpRepoSpec).httpConfig.password = values.httpConfig.basicAuth.password;
    }

    if (values.httpConfig.mTlsAuth?.use) {
      const tlsCrt = values.httpConfig.mTlsAuth.tlsCrt;
      if (tlsCrt) {
        (spec as GitHttpRepoSpec).httpConfig['tls.crt'] = btoa(tlsCrt);
      }
      const tlsKey = values.httpConfig.mTlsAuth.tlsKey;
      if (tlsKey) {
        (spec as GitHttpRepoSpec).httpConfig['tls.key'] = btoa(tlsKey);
      }
    }
  } else if (values.configType === 'ssh' && values.sshConfig) {
    (spec as GitSshRepoSpec).sshConfig = {
      privateKeyPassphrase: values.sshConfig.privateKeyPassphrase,
      skipServerVerification: values.sshConfig.skipServerVerification,
    };

    const sshPrivateKey = values.sshConfig.sshPrivateKey;
    if (sshPrivateKey) {
      (spec as GitSshRepoSpec).sshConfig.sshPrivateKey = btoa(sshPrivateKey);
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
      labels: { repository: repositoryId },
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
