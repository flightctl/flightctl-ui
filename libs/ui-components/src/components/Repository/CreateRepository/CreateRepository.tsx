import * as React from 'react';
import { Formik } from 'formik';
import { TestContext, array, boolean, lazy, object, string } from 'yup';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  PageSection,
  PageSectionVariants,
  Spinner,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useFetch } from '../../../hooks/useFetch';

import { RepositoryFormValues, ResourceSyncFormValue } from './types';
import CreateRepositoryForm from './CreateRepositoryForm';

import { isPromiseRejected } from '../../../types/typeUtils';
import { Repository, ResourceSync, ResourceSyncList } from '@flightctl/types';
import { getErrorMessage } from '../../../utils/error';
import { API_VERSION } from '../../../constants';
import { Link, ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';

const gitRegex = new RegExp(/^((http|git|ssh|http(s)|file|\/?)|(git@[\w.]+))(:(\/\/)?)([\w.@:/\-~]+)(\.git)?(\/)?$/);
const repoNameRegex = /^[a-zA-Z0-9-_\\.]+$/;
const pathRegex = /\/.+/;

export const repoSyncSchema = (t: TFunction, values: ResourceSyncFormValue[]) => {
  return array()
    .of(
      object().shape({
        name: string()
          .defined(t('Name is required.'))
          .test('Must be unique', t('Must be unique'), (value) => {
            if (!value) {
              return true;
            }
            return values.filter((v) => v.name === value).length === 1;
          }),
        targetRevision: string().defined(t('Target revision is required.')),
        path: string().matches(pathRegex, t('Must be an absolute path.')).defined(t('Path is required.')),
      }),
    )
    .required();
};

export const repositorySchema =
  (t: TFunction, repository: Repository | undefined) => (values: RepositoryFormValues) => {
    return object({
      name: repository
        ? string()
        : string()
            .defined(t('Name is required'))
            .matches(repoNameRegex, t('Name can only contain alphanumeric characters, and the characters ., -, and _.'))
            .max(255, t('Name must not exceed 255 characters')),
      url: string()
        .matches(gitRegex, t('Enter a valid repository URL. Example: https://github.com/flightctl/flightctl-demos'))
        .defined(t('Repository URL is required')),
      isPrivate: boolean().required(),
      username: string()
        .trim()
        .when('isPrivate', {
          is: true,
          then: (schema) => schema.required(t('Username is required for private repositories')),
        }),
      password: string()
        .trim()
        .test(
          'enter-new-user-password',
          t("The repository's username or URL has changed. Please enter the new password."),
          (password: string | undefined, context: TestContext) => {
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
          (password: string | undefined, context: TestContext) => {
            // This check handles only the creation of private repositories
            const updatedDetails = context.parent as RepositoryFormValues;
            if (repository || !updatedDetails.isPrivate) {
              return true;
            }

            return Boolean(password);
          },
        ),

      useResourceSyncs: boolean(),
      resourceSyncs: values.useResourceSyncs ? repoSyncSchema(t, values.resourceSyncs) : array(),
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

const shouldUpdateRepositoryDetails = (values: RepositoryFormValues, repository: Repository) => {
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

const getInitValues = (repository?: Repository, resourceSyncs?: ResourceSync[]): RepositoryFormValues => {
  if (!repository) {
    return {
      exists: false,
      name: '',
      url: '',
      isPrivate: false,
      username: '',
      password: '',
      useResourceSyncs: true,
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

const CreateRepository = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    router: { useParams },
  } = useAppContext();
  const { repositoryId } = useParams<{ repositoryId: string }>();
  const { post, get, put, remove } = useFetch();
  const [errors, setErrors] = React.useState<string[]>();
  const [isLoading, setIsLoading] = React.useState(!!repositoryId);
  const [repositoryDetails, setRepositoryDetails] = React.useState<Repository>();
  const [resourceSyncs, setResourceSyncs] = React.useState<ResourceSync[]>();

  React.useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const results = await Promise.allSettled([
          await get<Repository>(`repositories/${repositoryId}`),
          await get<ResourceSyncList>(`resourcesyncs?labelSelector=repository=${repositoryId}`),
        ]);

        const rejectedPromises = results.filter(isPromiseRejected);
        if (rejectedPromises.length === 0) {
          setRepositoryDetails((results[0] as PromiseFulfilledResult<Repository>).value);
          setResourceSyncs((results[1] as PromiseFulfilledResult<ResourceSyncList>).value.items);
        } else {
          const errors: string[] = [];
          if (isPromiseRejected(results[0])) {
            errors.push(`${t('Failed to fetch repository')} ${getErrorMessage(results[0].reason)}}`);
          }
          if (isPromiseRejected(results[1])) {
            errors.push(`${t('Failed to fetch resource syncs')} ${getErrorMessage(results[1].reason)}}`);
          }
          setErrors(errors);
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (repositoryId) {
      void fetchResources();
    }
  }, [get, repositoryId, t]);

  return (
    <PageSection variant={PageSectionVariants.light}>
      <Stack hasGutter>
        <StackItem>
          <Breadcrumb>
            <BreadcrumbItem>
              <Link to={ROUTE.REPOSITORIES}>{t('Repositories')}</Link>
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{repositoryId ? t('Edit repository') : t('Create repository')}</BreadcrumbItem>
          </Breadcrumb>
          <Title headingLevel="h1" size="3xl">
            {repositoryId ? t('Edit repository') : t('Create repository')}
          </Title>
        </StackItem>
        <StackItem>
          {isLoading ? (
            <Bullseye>
              <Spinner />
            </Bullseye>
          ) : (
            <Formik<RepositoryFormValues>
              initialValues={getInitValues(repositoryDetails, resourceSyncs)}
              validationSchema={lazy(repositorySchema(t, repositoryDetails))}
              validateOnChange={false}
              onSubmit={async (values) => {
                setErrors(undefined);
                if (repositoryId) {
                  try {
                    if (shouldUpdateRepositoryDetails(values, repositoryDetails as Repository)) {
                      await put<Repository>(`repositories/${repositoryId}`, getRepository(values));
                    }
                    if (values.useResourceSyncs) {
                      const storedRSs = resourceSyncs || [];
                      const rsToRemovePromises = storedRSs
                        .filter(
                          (storedRs) => !values.resourceSyncs.some((formRs) => formRs.name === storedRs.metadata.name),
                        )
                        .map((rs) => remove(`resourcesyncs/${rs.metadata.name}`));

                      const rsToAddPromises = values.resourceSyncs
                        .filter((formRs) => !storedRSs.some((r) => r.metadata.name === formRs.name))
                        .map((rs) => post<ResourceSync>('resourcesyncs', getResourceSync(values.name, rs)));

                      const rsToUpdatePromises = values.resourceSyncs
                        .filter((formRs) => {
                          const resourceSync = storedRSs.find((storedRs) => storedRs.metadata.name === formRs.name);
                          return (
                            resourceSync &&
                            (resourceSync.spec.path !== formRs.path ||
                              resourceSync.spec.targetRevision !== formRs.targetRevision)
                          );
                        })
                        .map((rs) => put<ResourceSync>(`resourcesyncs/${rs.name}`, getResourceSync(values.name, rs)));

                      const errors = await handlePromises([
                        ...rsToRemovePromises,
                        ...rsToAddPromises,
                        ...rsToUpdatePromises,
                      ]);
                      if (errors.length) {
                        setErrors(errors);
                        return;
                      }
                    } else if (resourceSyncs?.length) {
                      const resourceSyncPromises = resourceSyncs.map((rs) =>
                        remove(`resourcesyncs/${rs.metadata.name}`),
                      );

                      const errors = await handlePromises(resourceSyncPromises);
                      if (errors.length) {
                        setErrors(errors);
                        return;
                      }
                    }
                    navigate({ route: ROUTE.REPO_DETAILS, postfix: values.name });
                  } catch (e) {
                    setErrors([getErrorMessage(e)]);
                  }
                } else {
                  try {
                    await post<Repository>('repositories', getRepository(values));
                    if (values.useResourceSyncs) {
                      const resourceSyncPromises = values.resourceSyncs.map((rs) =>
                        post<ResourceSync>('resourcesyncs', getResourceSync(values.name, rs)),
                      );
                      const errors = await handlePromises(resourceSyncPromises);
                      if (errors.length) {
                        setErrors(errors);
                        return;
                      }
                    }
                    navigate({ route: ROUTE.REPO_DETAILS, postfix: values.name });
                  } catch (e) {
                    setErrors([getErrorMessage(e)]);
                  }
                }
              }}
            >
              <CreateRepositoryForm isEdit={!!repositoryDetails}>
                {errors?.length && (
                  <Alert isInline variant="danger" title={t('An error occurred')}>
                    {errors.map((e, index) => (
                      <div key={index}>{e}</div>
                    ))}
                  </Alert>
                )}
              </CreateRepositoryForm>
            </Formik>
          )}
        </StackItem>
      </Stack>
    </PageSection>
  );
};

export default CreateRepository;
