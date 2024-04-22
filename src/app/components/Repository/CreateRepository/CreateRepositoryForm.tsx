import * as React from 'react';
import { Button, Checkbox, Form, FormGroup, FormSection, Grid } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { useNavigate } from 'react-router-dom';

import TextField from '@app/components/form/TextField';
import FlightCtlActionGroup from '@app/components/form/FlightCtlActionGroup';
import { RepositoryFormValues } from './types';
import CreateResourceSyncsForm from './CreateResourceSyncsForm';
import { useTranslation } from 'react-i18next';

export const RepositoryForm = ({ isEdit }: { isEdit?: boolean }) => {
  const { t } = useTranslation();
  const { values, setFieldValue } = useFormikContext<RepositoryFormValues>();
  return (
    <>
      <FormGroup label={t('Repository name')} isRequired>
        <TextField name="name" aria-label={t('Repository name')} value={values.name} isDisabled={isEdit} />
      </FormGroup>
      <FormGroup label={t('Repository URL')} isRequired>
        <TextField
          name="url"
          aria-label={t('Repository URL')}
          value={values.url}
          helperText={t('For example: https://github.com/flightctl/flightctl-demos')}
        />
      </FormGroup>
      <FormSection>
        <Checkbox
          id="private-repository"
          label={t('This is a private repository')}
          isChecked={values.credentials.isPrivate}
          onChange={(_, checked) => setFieldValue('credentials.isPrivate', checked)}
        />
        {values.credentials.isPrivate && (
          <>
            <FormGroup label={t('Username')}>
              <TextField name="credentials.username" aria-label={t('Username')} value={values.credentials.username} />
            </FormGroup>
            <FormGroup label={t('Password')}>
              <TextField
                name="credentials.password"
                aria-label={t('Password')}
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
