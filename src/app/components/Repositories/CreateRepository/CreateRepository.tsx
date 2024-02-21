import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, useFormikContext } from 'formik';
import {
  ActionGroup,
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Form,
  FormGroup,
  FormSection,
  Grid,
  PageSection,
  PageSectionVariants,
  Stack,
  StackItem,
  TextInput,
  Title,
} from '@patternfly/react-core';
import { useFetch } from '@app/hooks/useFetch';

import { RepositoryFormValues } from './types';
import { Repository } from '@types';
import { getErrorMessage } from '@app/utils/error';
import { API_VERSION } from '@app/constants';

const getRepository = (values: RepositoryFormValues) => {
  const spec: Partial<Repository['spec']> = {
    repo: values.url,
  };
  if (values.credentials.user && values.credentials.password) {
    spec.username = values.credentials.user;
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
  const { values, setFieldValue, submitForm, isSubmitting } = useFormikContext<RepositoryFormValues>();
  return (
    <Form>
      <Grid hasGutter span={8}>
        <FormGroup label="Name" isRequired>
          <TextInput aria-label="Name" value={values.name} onChange={(_, value) => setFieldValue('name', value)} />
        </FormGroup>
        <FormGroup label="Url" isRequired>
          <TextInput aria-label="Url" value={values.url} onChange={(_, value) => setFieldValue('url', value)} />
        </FormGroup>
        <FormSection title="Credentials">
          <FormGroup label="Username">
            <TextInput
              aria-label="Username"
              value={values.credentials.user}
              onChange={(_, value) => setFieldValue('credentials.user', value)}
            />
          </FormGroup>
          <FormGroup label="Password">
            <TextInput
              aria-label="Password"
              type="password"
              value={values.credentials.password}
              onChange={(_, value) => setFieldValue('credentials.password', value)}
            />
          </FormGroup>
        </FormSection>
      </Grid>
      {children}
      <ActionGroup>
        <Button variant="primary" onClick={submitForm} isLoading={isSubmitting} isDisabled={isSubmitting}>
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
            <BreadcrumbItem to="#" isActive>
              Create repository
            </BreadcrumbItem>
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
                user: '',
                password: '',
              },
            }}
            onSubmit={async (values) => {
              setError(undefined);
              try {
                await post<Repository>('repositories', getRepository(values));
                navigate('/administration/repositories');
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
