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
import { useFetch } from '@app/hooks/useFetch';

import { RepositoryFormValues, ResourceSyncFormValue } from './types';
import { Repository, RepositoryList, ResourceSync, ResourceSyncList } from '@types';
import { getErrorMessage } from '@app/utils/error';
import { API_VERSION } from '@app/constants';
import CreateRepositoryForm from './CreateRepositoryForm';

const gitRegex = new RegExp(/^((http|git|ssh|http(s)|file|\/?)|(git@[\w.]+))(:(\/\/)?)([\w.@:/\-~]+)(\.git)?(\/)?$/);
const repoNameRegex = /^[a-zA-Z0-9-_\\.]+$/;
const pathRegex = /\/.+/;

export const repoSyncSchema = (
  values: ResourceSyncFormValue[],
  resourceSyncs: ResourceSync[],
  repositoryId?: string,
) => {
  const existingNames = resourceSyncs
    .filter((rs) => (repositoryId ? rs.spec.repository !== repositoryId : true))
    .map((rs) => rs.metadata.name || '');
  return array()
    .of(
      object().shape({
        name: string()
          .required('Name is required.')
          .test('Must be unique', 'Must be unique', (value) => {
            if (!value) {
              return true;
            }
            return values.filter((v) => v.name === value).length === 1;
          })
          .notOneOf(existingNames, 'Resource sync with the same name already exists.'),
        targetRevision: string().required('Target revision is required.'),
        path: string().matches(pathRegex, 'Must be an absolute path.').required('Path is required.'),
      }),
    )
    .required();
};

export const repositorySchema =
  (resourceSyncs: ResourceSync[], repositories: Repository[], repositoryId?: string) =>
  (values: RepositoryFormValues) => {
    const repoNames = repositories.map((r) => r.metadata.name || '');
    return object({
      name: repositoryId
        ? string()
        : string()
            .required('Name is required')
            .notOneOf(repoNames, 'Repository with the same name already exists.')
            .matches(repoNameRegex, 'Name can only contain alphanumeric characters, and the characters ., -, and _.')
            .max(255, 'Name must not exceed 255 characters'),
      url: string()
        .matches(gitRegex, 'Enter a valid repository URL. Example: https://github.com/flightctl/flightctl-demos')
        .required('Repository URL is required'),
      credentials: object()
        .shape({
          isPrivate: boolean().required(),
          username: string()
            .trim()
            .when('isPublic', {
              is: false,
              then: (schema) => schema.required('Username is required for private repositories'),
            }),
          password: string()
            .trim()
            .when('isPublic', {
              is: false,
              then: (schema) => schema.required('Password is required for private repositories'),
            }),
        })
        .required(),
      useResourceSyncs: boolean(),
      resourceSyncs: values.useResourceSyncs
        ? repoSyncSchema(values.resourceSyncs, resourceSyncs, repositoryId)
        : array(),
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
  const navigate = useNavigate();
  const { repositoryId } = useParams<{ repositoryId: string }>();
  const { post, get, put, remove } = useFetch();
  const [errors, setErrors] = React.useState<string[]>();
  const [isLoading, setIsLoading] = React.useState(!!repositoryId);
  const [repositories, setRepositories] = React.useState<Repository[]>();
  const [resourceSyncs, setResourceSyncs] = React.useState<ResourceSync[]>();

  React.useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      const results = await Promise.allSettled([
        get<RepositoryList>('repositories'),
        get<ResourceSyncList>('resourcesyncs'),
      ]);
      if (results[0].status === 'rejected') {
        setErrors([`Failed to fetch repositories: ${getErrorMessage(results[0].reason)}`]);
        return;
      }
      setRepositories(results[0].value.items);

      if (results[1].status === 'rejected') {
        setErrors([`Failed to fetch resource syncs: ${getErrorMessage(results[1].reason)}`]);
        return;
      }
      setResourceSyncs(results[1].value.items);
      setIsLoading(false);
    };
    fetchResources();
  }, [get]);

  const repository = repositories?.find((r) => r.metadata.name === repositoryId);

  return (
    <PageSection variant={PageSectionVariants.light}>
      <Stack hasGutter>
        <StackItem>
          <Breadcrumb>
            <BreadcrumbItem>
              <Link to="/devicemanagement/repositories">Repositories</Link>
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{repositoryId ? 'Edit repository' : 'Create repository'}</BreadcrumbItem>
          </Breadcrumb>
          <Title headingLevel="h1" size="3xl">
            {repositoryId ? 'Edit repository' : 'Create repository'}
          </Title>
        </StackItem>
        <StackItem>
          {isLoading ? (
            <Bullseye>
              <Spinner />
            </Bullseye>
          ) : (
            <Formik<RepositoryFormValues>
              initialValues={getInitValues(repository, resourceSyncs)}
              validationSchema={lazy(repositorySchema(resourceSyncs || [], repositories || [], repositoryId))}
              onSubmit={async (values) => {
                setErrors(undefined);
                if (repositoryId) {
                  try {
                    if (values.url !== repository?.spec.repo) {
                      await put<Repository>(`repositories/${repositoryId}`, getRepository(values));
                    }
                    if (values.useResourceSyncs) {
                      const rsToRemovePromises = (resourceSyncs || [])
                        ?.filter((rs) => !values.resourceSyncs.some((r) => r.name === rs.metadata.name))
                        .map((rs) => remove('resourcesyncs', rs.metadata.name || ''));

                      const rsToAddPromises = values.resourceSyncs
                        .filter((rs) => !(resourceSyncs || []).some((r) => r.metadata.name === rs.name))
                        .map((rs) => post<ResourceSync>('resourcesyncs', getResourceSync(values.name, rs)));

                      const rsToUpdatePromises = values.resourceSyncs
                        .filter((rs) => {
                          const resourceSync = (resourceSyncs || []).find((r) => r.metadata.name === rs.name);
                          return (
                            resourceSync?.spec.path !== rs.path ||
                            resourceSync.spec.targetRevision !== rs.targetRevision
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
              <CreateRepositoryForm isEdit={!!repository}>
                {errors?.length && (
                  <Alert isInline variant="danger" title="An error occured">
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
