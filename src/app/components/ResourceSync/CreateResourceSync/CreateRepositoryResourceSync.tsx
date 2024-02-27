import * as React from 'react';
import { Formik, useFormikContext } from 'formik';
import { ActionGroup, Alert, Button, Form, FormGroup, Grid, TextInput } from '@patternfly/react-core';
import { ResourceSync } from '@types';
import { useFetch } from '@app/hooks/useFetch';
import { getErrorMessage } from '@app/utils/error';
import { API_VERSION } from '@app/constants';

type RepositoryResourceSyncValues = {
  name: string;
  targetRevision: string;
  path: string;
};

const getResourceSync = (repositoryId: string, values: RepositoryResourceSyncValues): ResourceSync => {
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

const CreateRepositoryResourceSyncForm = ({
  onSuccess,
  onCancel,
  children,
}: React.PropsWithChildren<{ onSuccess: VoidFunction; onCancel: VoidFunction }>) => {
  const { values, setFieldValue, submitForm, isSubmitting } = useFormikContext<RepositoryResourceSyncValues>();

  const formSubmit = async () => {
    await submitForm();
    onSuccess();
  };

  return (
    <Form>
      <Grid hasGutter span={8}>
        <FormGroup label="Name" isRequired>
          <TextInput aria-label="Name" value={values.name} onChange={(_, value) => setFieldValue('name', value)} />
        </FormGroup>
        <FormGroup label="Target revision" isRequired>
          <TextInput
            aria-label="Target revision"
            value={values.targetRevision}
            onChange={(_, value) => setFieldValue('targetRevision', value)}
          />
        </FormGroup>
        <FormGroup label="Path" isRequired>
          <TextInput aria-label="Path" value={values.path} onChange={(_, value) => setFieldValue('path', value)} />
        </FormGroup>
      </Grid>
      {children}
      <ActionGroup>
        <Button variant="primary" onClick={formSubmit} isLoading={isSubmitting} isDisabled={isSubmitting}>
          Create resource sync
        </Button>
        <Button variant="link" isDisabled={isSubmitting} onClick={onCancel}>
          Cancel
        </Button>
      </ActionGroup>
    </Form>
  );
};

const CreateRepositoryResourceSync = ({
  repositoryId,
  onSuccess,
  onCancel,
}: {
  repositoryId: string;
  onSuccess: VoidFunction;
  onCancel: VoidFunction;
}) => {
  const [error, setError] = React.useState<string>();
  const { post } = useFetch();

  return (
    <Formik<RepositoryResourceSyncValues>
      initialValues={{
        name: '',
        targetRevision: '',
        path: '',
      }}
      onSubmit={async (values) => {
        setError(undefined);
        try {
          await post<ResourceSync>('resourcesyncs', getResourceSync(repositoryId, values));
          onSuccess();
        } catch (e) {
          setError(getErrorMessage(e));
        }
      }}
    >
      <CreateRepositoryResourceSyncForm onSuccess={onSuccess} onCancel={onCancel}>
        {error && (
          <Alert isInline variant="danger" title="An error occured">
            {error}
          </Alert>
        )}
      </CreateRepositoryResourceSyncForm>
    </Formik>
  );
};

export default CreateRepositoryResourceSync;
