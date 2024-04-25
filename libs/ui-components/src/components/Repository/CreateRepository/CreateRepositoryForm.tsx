import * as React from 'react';
import { Button, Checkbox, Form, FormGroup, FormSection, Grid } from '@patternfly/react-core';
import { Field, useFormikContext } from 'formik';
import { useTranslation } from '../../../hooks/useTranslation';

import { useFetch } from '../../../hooks/useFetch';
import TextField from '../../form/TextField';
import FlightCtlActionGroup from '../../form/FlightCtlActionGroup';
import { RepositoryFormValues } from './types';
import CreateResourceSyncsForm from './CreateResourceSyncsForm';

import { useNavigate } from '../../../hooks/useNavigate';

export const RepositoryForm = ({ isEdit }: { isEdit?: boolean }) => {
  const { t } = useTranslation();
  const { get } = useFetch();
  const { values, setFieldValue, setFieldTouched } = useFormikContext<RepositoryFormValues>();

  const validateExistingRepositoryName = async (name: string) => {
    const repoExists = values.exists;
    if (repoExists || !name) {
      // We should not validate the item against itself
      return undefined;
    }
    try {
      await get(`repositories/${name}`);
      return t(`A repository named "{{name}}" already exists`, { name });
    } catch (e) {
      return undefined;
    }
  };

  return (
    <>
      <FormGroup label={t('Repository name')} isRequired>
        <Field name="name" validate={validateExistingRepositoryName}>
          {() => <TextField name="name" aria-label={t('Repository name')} value={values.name} isDisabled={isEdit} />}
        </Field>
      </FormGroup>
      <FormGroup label={t('Repository URL')} isRequired>
        <TextField
          name="url"
          aria-label={t('Repository URL')}
          value={values.url}
          helperText={t('For example: https://github.com/flightctl/flightctl-demos')}
          onBlur={() => {
            // We need to ask the user to enter a new password
            setFieldTouched('url', true);
            if (isEdit) {
              setFieldTouched('password', true);
            }
          }}
        />
      </FormGroup>
      <FormSection>
        <Checkbox
          id="private-repository"
          label={t('This is a private repository')}
          isChecked={values.isPrivate}
          onChange={(_, checked) => setFieldValue('isPrivate', checked)}
        />
        {values.isPrivate && (
          <>
            <FormGroup label={t('Username')}>
              <TextField
                name="username"
                aria-label={t('Username')}
                value={values.username}
                onBlur={() => {
                  // We need to ask the user to enter a new password
                  setFieldTouched('username', true);
                  if (isEdit) {
                    setFieldTouched('password', true);
                  }
                }}
              />
            </FormGroup>
            <FormGroup label={t('Password')}>
              <TextField
                name="password"
                helperText={
                  isEdit ? t('Leave the password blank to keep it unchanged. Enter a new password to update it.') : ''
                }
                aria-label={t('Password')}
                value={values.password}
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

const CreateRepositoryForm = ({ isEdit, children }: CreateRepositoryFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { values, setFieldValue, isValid, dirty, submitForm, isSubmitting } = useFormikContext<RepositoryFormValues>();
  const isSubmitDisabled = isSubmitting || !dirty || !isValid;

  return (
    <Form>
      <Grid hasGutter span={8}>
        <RepositoryForm isEdit={isEdit} />
        <Checkbox
          id="use-resource-syncs"
          label={t('Use resource syncs')}
          isChecked={values.useResourceSyncs}
          onChange={(_, checked) => setFieldValue('useResourceSyncs', checked)}
          body={values.useResourceSyncs && <CreateResourceSyncsForm />}
        />
      </Grid>
      {children}
      <FlightCtlActionGroup>
        <Button variant="primary" onClick={submitForm} isLoading={isSubmitting} isDisabled={isSubmitDisabled}>
          {isEdit ? t('Edit repository') : t('Create repository')}
        </Button>
        <Button variant="link" isDisabled={isSubmitting} onClick={() => navigate(-1)}>
          {t('Cancel')}
        </Button>
      </FlightCtlActionGroup>
    </Form>
  );
};

export default CreateRepositoryForm;
