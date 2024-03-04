import * as React from 'react';
import { ActionGroup, Alert, Button, Form, FormGroup, Grid } from '@patternfly/react-core';
import { Formik, useFormikContext } from 'formik';
import { ObjectSchema, object, string } from 'yup';

import { ResourceSync } from '@types';
import { useFetch } from '@app/hooks/useFetch';
import { getErrorMessage } from '@app/utils/error';
import { API_VERSION } from '@app/constants';
import TextField from '@app/components/form/TextField';

type RepositoryResourceSyncValues = {
  name: string;
  targetRevision: string;
  path: string;
};

const pathRegex = /\/.+/;

const resourceSyncSchema: ObjectSchema<RepositoryResourceSyncValues> = object({
  name: string().required('Name is required'),
  targetRevision: string().required('Target revision is required'),
  path: string().matches(pathRegex, 'Must be an absolute path').required('Path is required'),
});

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
  const { values, isValid, dirty, submitForm, isSubmitting } = useFormikContext<RepositoryResourceSyncValues>();
  const isSubmitDisabled = isSubmitting || !dirty || !isValid;

  const formSubmit = async () => {
    await submitForm();

    if (isValid && dirty) {
      // Only close the form when the form is filled in and valid
      onSuccess();
    }
  };

  return (
    <Form>
      <Grid hasGutter span={8}>
        <FormGroup label="Name" isRequired>
          <TextField name="name" aria-label="Name" value={values.name} />
        </FormGroup>
        <FormGroup label="Target revision" isRequired>
          <TextField
            name="targetRevision"
            aria-label="Target revision"
            value={values.targetRevision}
            helperText="Name of a branch or a tag. Example: main"
          />
        </FormGroup>
        <FormGroup label="Path" isRequired>
          <TextField
            name="path"
            aria-label="Path"
            value={values.path}
            helperText="Absolute path to the file or directory holding the resource definitions. Example: /inverter-fleet/fleets/eu-west-prod-001/fleet.yaml"
          />
        </FormGroup>
      </Grid>
      {children}
      <ActionGroup>
        <Button variant="primary" onClick={formSubmit} isLoading={isSubmitting} isDisabled={isSubmitDisabled}>
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
      validationSchema={resourceSyncSchema}
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
