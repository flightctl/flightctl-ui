import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, useFormikContext } from 'formik';
import { ObjectSchema, boolean, object, string } from 'yup';
import {
  ActionGroup,
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Checkbox,
  Form,
  FormGroup,
  FormSection,
  Grid,
  PageSection,
  PageSectionVariants,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { useFetch } from '@app/hooks/useFetch';

import { RepositoryFormValues } from './types';
import { Repository } from '@types';
import { getErrorMessage } from '@app/utils/error';
import { API_VERSION } from '@app/constants';
import TextField from '@app/components/form/TextField';

const gitRegex = new RegExp(/^((http|git|ssh|http(s)|file|\/?)|(git@[\w.]+))(:(\/\/)?)([\w.@:/\-~]+)(\.git)(\/)?$/);

const repositorySchema: ObjectSchema<RepositoryFormValues> = object({
  name: string().required('Name is required'),
  url: string()
    .matches(gitRegex, 'Repository URL format is invalid. Enter the URL used for cloning the repository')
    .required('Repository URL is required'),
  credentials: object()
    .shape({
      isPublic: boolean().required(),
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
});

const getRepository = (values: RepositoryFormValues) => {
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

const CreateRepositoryForm = ({ children }: React.PropsWithChildren<Record<never, never>>) => {
  const navigate = useNavigate();
  const { values, setFieldValue, isValid, dirty, submitForm, isSubmitting } = useFormikContext<RepositoryFormValues>();
  const isSubmitDisabled = isSubmitting || !dirty || !isValid;

  return (
    <Form>
      <Grid hasGutter span={8}>
        <FormGroup label="Name" isRequired>
          <TextField name="name" aria-label="Name" value={values.name} />
        </FormGroup>
        <FormGroup label="Url" isRequired>
          <TextField
            name="url"
            aria-label="Url"
            value={values.url}
            helperText="Repository URL as defined for cloning the repository. Example: https://github.com/flightctl/flightctl-demos.git"
          />
        </FormGroup>
        <FormSection title="Credentials">
          <div>
            <Checkbox
              id="public-repository"
              isChecked={values.credentials.isPublic}
              onChange={() => setFieldValue('credentials.isPublic', !values.credentials.isPublic)}
            />{' '}
            This repository can be accessed publicly
          </div>
          {!values.credentials.isPublic && (
            <>
              <FormGroup label="Username">
                <TextField name="credentials.username" aria-label="Username" value={values.credentials.username} />
              </FormGroup>
              <FormGroup label="Password">
                <TextField
                  name="credentials.password"
                  aria-label="Password"
                  value={values.credentials.password}
                  type="password"
                />
              </FormGroup>
            </>
          )}
        </FormSection>
      </Grid>
      {children}
      <ActionGroup>
        <Button variant="primary" onClick={submitForm} isLoading={isSubmitting} isDisabled={isSubmitDisabled}>
          Create repository
        </Button>
        <Button variant="link" isDisabled={isSubmitting} onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </ActionGroup>
    </Form>
  );
};

const CreateRepository = () => {
  const navigate = useNavigate();
  const { post } = useFetch();
  const [error, setError] = React.useState<string>();
  return (
    <PageSection variant={PageSectionVariants.light}>
      <Stack hasGutter>
        <StackItem>
          <Breadcrumb>
            <BreadcrumbItem to="/administration/repositories">Repositories</BreadcrumbItem>
            <BreadcrumbItem isActive>Create repository</BreadcrumbItem>
          </Breadcrumb>
          <Title headingLevel="h1" size="3xl">
            Create repository
          </Title>
        </StackItem>
        <StackItem>
          <Formik<RepositoryFormValues>
            initialValues={{
              name: '',
              url: '',
              credentials: {
                isPublic: true,
                username: '',
                password: '',
              },
            }}
            validationSchema={repositorySchema}
            onSubmit={async (values) => {
              setError(undefined);
              try {
                await post<Repository>('repositories', getRepository(values));
                navigate(`/administration/repositories/${values.name}`);
              } catch (e) {
                setError(getErrorMessage(e));
              }
            }}
          >
            <CreateRepositoryForm>
              {error && (
                <Alert isInline variant="danger" title="An error occured">
                  {error}
                </Alert>
              )}
            </CreateRepositoryForm>
          </Formik>
        </StackItem>
      </Stack>
    </PageSection>
  );
};

export default CreateRepository;
