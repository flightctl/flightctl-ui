import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Formik } from 'formik';
import { array, boolean, lazy, object, string } from 'yup';
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

import { useFetch } from '@app/hooks/useFetch';
import { RepositoryFormValues, ResourceSyncFormValue } from './types';
import { Repository, ResourceSync, ResourceSyncList } from '@types';
import { getErrorMessage } from '@app/utils/error';
import { API_VERSION } from '@app/constants';
import CreateRepositoryForm from './CreateRepositoryForm';

import { isPromiseRejected } from '@app/types/typeUtils';

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

export const repositorySchema = (t: TFunction, repositoryId: string | undefined) => (values: RepositoryFormValues) => {
  return object({
    name: repositoryId
      ? string()
      : string()
          .defined(t('Name is required'))
          .matches(repoNameRegex, t('Name can only contain alphanumeric characters, and the characters ., -, and _.'))
          .max(255, t('Name must not exceed 255 characters')),
    url: string()
      .matches(gitRegex, t('Enter a valid repository URL. Example: https://github.com/flightctl/flightctl-demos'))
      .defined(t('Repository URL is required')),
    credentials: object()
      .shape({
        isPrivate: boolean().required(),
        username: string()
          .trim()
          .when('isPublic', {
            is: false,
            then: (schema) => schema.required(t('Username is required for private repositories')),
          }),
        password: string()
          .trim()
          .when('isPublic', {
            is: false,
            then: (schema) => schema.required(t('Password is required for private repositories')),
          }),
      })
      .required(),
    useResourceSyncs: boolean(),
    resourceSyncs: values.useResourceSyncs ? repoSyncSchema(t, values.resourceSyncs) : array(),
  });
};

export const getRepository = (values: Pick<RepositoryFormValues, 'name' | 'url' | 'credentials'>) => {
  const spec: Partial<Repository['spec']> = {
    repo: values.url,
  };
  if (values.credentials?.username && values.credentials?.password) {
    spec.username = values.credentials.username;
    spec.password = values.credentials.password;
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

const getInitValues = (repository?: Repository, resourceSyncs?: ResourceSync[]): RepositoryFormValues => {
  if (!repository) {
    return {
      exists: false,
      name: '',
      url: '',
      credentials: {
        isPrivate: false,
        username: '',
        password: '',
      },
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
    credentials: {
      isPrivate: !!repository.spec.username,
      username: repository.spec.username,
      password: repository.spec.password,
    },
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
              <Link to="/devicemanagement/repositories">{t('Repositories')}</Link>
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
              validationSchema={lazy(repositorySchema(t, repositoryId))}
              validateOnChange={false}
              onSubmit={async (values) => {
                setErrors(undefined);
                if (repositoryId) {
                  try {
                    const storedRSs = resourceSyncs || [];
                    if (values.url !== repositoryDetails?.spec.repo) {
                      await put<Repository>(`repositories/${repositoryId}`, getRepository(values));
                    }
                    if (values.useResourceSyncs) {
                      const rsToRemovePromises = storedRSs
                        .filter(
                          (storedRs) => !values.resourceSyncs.some((formRs) => formRs.name === storedRs.metadata.name),
                        )
                        .map((rs) => remove('resourcesyncs', rs.metadata.name || ''));

                      const rsToAddPromises = values.resourceSyncs
                        .filter((formRs) => !storedRSs.some((r) => r.metadata.name === formRs.name))
                        .map((rs) => post<ResourceSync>('resourcesyncs', getResourceSync(values.name, rs)));

                      const rsToUpdatePromises = values.resourceSyncs
                        .filter((formRs) => {
                          const resourceSync = storedRSs.find((storedRs) => storedRs.metadata.name === formRs.name);
                          return (
                            resourceSync?.spec.path !== formRs.path ||
                            resourceSync.spec.targetRevision !== formRs.targetRevision
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
                        remove('resourcesyncs', rs.metadata.name || ''),
                      );

                      const errors = await handlePromises(resourceSyncPromises);
                      if (errors.length) {
                        setErrors(errors);
                        return;
                      }
                    }
                    navigate(`/devicemanagement/repositories/${values.name}`);
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
                    navigate(`/devicemanagement/repositories/${values.name}`);
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
