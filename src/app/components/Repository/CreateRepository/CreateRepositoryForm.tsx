import * as React from 'react';
import TextField from '@app/components/form/TextField';
import { ActionGroup, Button, Checkbox, Form, FormGroup, FormSection, Grid } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { useNavigate } from 'react-router-dom';
import { RepositoryFormValues } from './types';
import CreateResourceSyncsForm from './CreateResourceSyncsForm';

export const RepositoryForm = ({ isEdit }: { isEdit?: boolean }) => {
  const { values, setFieldValue } = useFormikContext<RepositoryFormValues>();
  return (
    <>
      <FormGroup label="Repository name" isRequired>
        <TextField name="name" aria-label="Repository name" value={values.name} isDisabled={isEdit} />
      </FormGroup>
      <FormGroup label="Repository URL" isRequired>
        <TextField
          name="url"
          aria-label="Repository URL"
          value={values.url}
          helperText="For example: https://github.com/flightctl/flightctl-demos"
        />
      </FormGroup>
      <FormSection>
        <Checkbox
          id="private-repository"
          label="This repository a private repository"
          isChecked={values.credentials.isPrivate}
          onChange={(_, checked) => setFieldValue('credentials.isPrivate', checked)}
        />
        {values.credentials.isPrivate && (
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
    </>
  );
};

type CreateRepositoryFormProps = React.PropsWithChildren<Record<never, never>> & {
  isEdit: boolean;
};

const CreateRepositoryForm: React.FC<CreateRepositoryFormProps> = ({ children, isEdit }) => {
  const navigate = useNavigate();
  const { values, setFieldValue, isValid, dirty, submitForm, isSubmitting } = useFormikContext<RepositoryFormValues>();
  const isSubmitDisabled = isSubmitting || !dirty || !isValid;

  return (
    <Form>
      <Grid hasGutter span={8}>
        <RepositoryForm isEdit={isEdit} />
        <Checkbox
          id="use-resource-syncs"
          label="Use resource syncs"
          isChecked={values.useResourceSyncs}
          onChange={(_, checked) => setFieldValue('useResourceSyncs', checked)}
          body={values.useResourceSyncs && <CreateResourceSyncsForm />}
        />
      </Grid>
      {children}
      <ActionGroup>
        <Button variant="primary" onClick={submitForm} isLoading={isSubmitting} isDisabled={isSubmitDisabled}>
          {isEdit ? 'Edit repository' : 'Create repository'}
        </Button>
        <Button variant="link" isDisabled={isSubmitting} onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </ActionGroup>
    </Form>
  );
};

export default CreateRepositoryForm;
