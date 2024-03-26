import * as React from 'react';
import TextField from '@app/components/form/TextField';
import { ActionGroup, Button, Checkbox, Form, FormGroup, FormSection, Grid } from '@patternfly/react-core';
import { FieldArray, useFormikContext } from 'formik';
import { useNavigate } from 'react-router-dom';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { RepositoryFormValues, ResourceSyncFormValue } from './types';

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
          <Checkbox
            id="use-resource-syncs"
            label="Use resource syncs"
            isChecked={values.useResourceSyncs}
            onChange={(_, checked) => setFieldValue('useResourceSyncs', checked)}
            body={
              values.useResourceSyncs && (
                <FieldArray name="resourceSyncs">
                  {({ remove, push }) => (
                    <>
                      {values.resourceSyncs.map((resourceSync, index) => (
                        <FormSection key={index}>
                          <FormGroup label="Resource sync name" isRequired>
                            <TextField
                              name={`resourceSyncs[${index}].name`}
                              aria-label="Resource sync name"
                              value={resourceSync.name}
                              isDisabled={resourceSync.exists}
                            />
                          </FormGroup>
                          <FormGroup label="Target revision" isRequired>
                            <TextField
                              name={`resourceSyncs[${index}].targetRevision`}
                              aria-label="Target revision"
                              value={resourceSync.targetRevision}
                              helperText="For example: main"
                            />
                          </FormGroup>
                          <FormGroup label="Path" isRequired>
                            <TextField
                              name={`resourceSyncs[${index}].path`}
                              aria-label="Path"
                              value={resourceSync.path}
                              helperText="For example: /inverter-fleet/fleets/eu-west-prod-001/fleet.yaml"
                            />
                          </FormGroup>
                          <FormGroup>
                            {values.resourceSyncs.length > 1 && (
                              <Button
                                variant="link"
                                icon={<MinusCircleIcon />}
                                iconPosition="left"
                                onClick={() => remove(index)}
                              >
                                Remove resource sync
                              </Button>
                            )}
                          </FormGroup>
                        </FormSection>
                      ))}
                      <FormSection>
                        <FormGroup>
                          <Button
                            variant="link"
                            icon={<PlusCircleIcon />}
                            iconPosition="left"
                            onClick={() => push({ name: '', path: '', targetRevision: '' } as ResourceSyncFormValue)}
                          >
                            Add resource sync
                          </Button>
                        </FormGroup>
                      </FormSection>
                    </>
                  )}
                </FieldArray>
              )
            }
          />
        </FormSection>
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
