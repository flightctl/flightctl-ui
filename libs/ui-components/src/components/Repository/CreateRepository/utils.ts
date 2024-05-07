import { Repository, ResourceSync } from '@flightctl/types';
import { RepositoryFormValues, ResourceSyncFormValue } from './types';
import { API_VERSION } from '../../../constants';
import { getErrorMessage } from '../../../utils/error';
import * as Yup from 'yup';
import { TFunction } from 'i18next';

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
      isPrivate: false,
      username: '',
      password: '',
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

  return {
    exists: true,
    name: repository.metadata.name || '',
    url: repository.spec.repo || '',
    isPrivate: !!repository.spec.username,
    username: repository.spec.username,
    password: '', // Password must be empty in any case as we don't have its value
    useResourceSyncs: !!resourceSyncs?.length,
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
};

export const shouldUpdateRepositoryDetails = (values: RepositoryFormValues, repository: Repository) => {
  const isStoredPrivate = !!repository.spec.username;
  const { isPrivate, username, password, url } = values;

  if (url !== repository.spec.repo) {
    // Url has changed
    return true;
  }

  if (isPrivate !== isStoredPrivate) {
    // Privacy has changed
    return true;
  }

  if (isStoredPrivate) {
    if (username !== repository.spec.username) {
      return true;
    }
    // If the user left the password blank, we shouldn't update it. Only if they typed a new one.
    if (password) {
      return true;
    }
  }
  return false;
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
      isPrivate: Yup.boolean().required(),
      username: Yup.string()
        .trim()
        .when('isPrivate', {
          is: true,
          then: (schema) => schema.required(t('Username is required for private repositories')),
        }),
      password: Yup.string()
        .trim()
        .test(
          'enter-new-user-password',
          t("The repository's username or URL has changed. Please enter the new password."),
          (password: string | undefined, context: Yup.TestContext) => {
            // This check handles only the edition of existing private repositories
            const updatedDetails = context.parent as RepositoryFormValues;
            if (!repository || !updatedDetails.isPrivate) {
              return true;
            }

            const shouldReenterPassword =
              updatedDetails.username !== repository?.spec.username || updatedDetails.url !== repository?.spec.repo;

            return Boolean(!shouldReenterPassword || password);
          },
        )
        .test(
          'password-is-needed',
          t('Password is required for private repositories'),
          (password: string | undefined, context: Yup.TestContext) => {
            // This check handles only the creation of private repositories
            const updatedDetails = context.parent as RepositoryFormValues;
            if (repository || !updatedDetails.isPrivate) {
              return true;
            }

            return Boolean(password);
          },
        ),

      useResourceSyncs: Yup.boolean(),
      resourceSyncs: values.useResourceSyncs ? repoSyncSchema(t, values.resourceSyncs) : Yup.array(),
    });
  };

export const getRepository = (
  values: Pick<RepositoryFormValues, 'name' | 'url' | 'username' | 'password' | 'isPrivate'>,
) => {
  const spec: Partial<Repository['spec']> = {
    repo: values.url,
  };
  if (values.isPrivate) {
    spec.username = values.username;
    spec.password = values.password;
  }

  return {
    apiVersion: API_VERSION,
    kind: 'Repository',
    metadata: {
      name: values.name,
    },
    spec: {
      ...spec,
    },
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
