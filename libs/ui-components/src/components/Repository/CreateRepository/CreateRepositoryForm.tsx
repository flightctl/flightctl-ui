import * as React from 'react';
import { Alert, Button, Checkbox, Form, FormGroup, FormSection, Grid } from '@patternfly/react-core';
import { Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from '../../../hooks/useTranslation';

import { useFetch } from '../../../hooks/useFetch';
import TextField from '../../form/TextField';
import FlightCtlActionGroup from '../../form/FlightCtlActionGroup';
import { RepositoryFormValues } from './types';
import CreateResourceSyncsForm from './CreateResourceSyncsForm';

import {
  getInitValues,
  getRepository,
  getResourceSync,
  handlePromises,
  repositorySchema,
  shouldUpdateRepositoryDetails,
} from './utils';
import { Repository, ResourceSync } from '@flightctl/types';
import { getErrorMessage } from '../../../utils/error';
import NameField from '../../form/NameField';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';

export const RepositoryForm = ({ isEdit }: { isEdit?: boolean }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, setFieldTouched } = useFormikContext<RepositoryFormValues>();

  return (
    <>
      <FormGroup label={t('Repository name')} isRequired>
        <NameField
          name="name"
          resourceType="repositories"
          getExistsErrMsg={(value) => t(`A repository named "{{value}}" already exists`, { value })}
        />
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
            <FormGroup label={t('Username')} isRequired>
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
            <FormGroup label={t('Password')} isRequired>
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

type CreateRepositoryFormContentProps = React.PropsWithChildren<Record<never, never>> &
  Pick<CreateRepositoryFormProps, 'hideResourceSyncs' | 'onClose'> & {
    isEdit: boolean;
  };

const CreateRepositoryFormContent = ({
  isEdit,
  children,
  hideResourceSyncs,
  onClose,
}: CreateRepositoryFormContentProps) => {
  const { t } = useTranslation();
  const { values, setFieldValue, isValid, dirty, submitForm, isSubmitting } = useFormikContext<RepositoryFormValues>();
  const isSubmitDisabled = isSubmitting || !dirty || !isValid;

  return (
    <Form>
      <Grid hasGutter span={8}>
        <RepositoryForm isEdit={isEdit} />
        {!hideResourceSyncs && (
          <Checkbox
            id="use-resource-syncs"
            label={t('Use resource syncs')}
            isChecked={values.useResourceSyncs}
            onChange={(_, checked) => {
              // Trigger validation of the resource syncs items
              return setFieldValue('useResourceSyncs', checked, true);
            }}
            body={values.useResourceSyncs && <CreateResourceSyncsForm />}
          />
        )}
      </Grid>
      {children}
      <FlightCtlActionGroup>
        <Button variant="primary" onClick={submitForm} isLoading={isSubmitting} isDisabled={isSubmitDisabled}>
          {isEdit ? t('Edit repository') : t('Create repository')}
        </Button>
        <Button variant="link" isDisabled={isSubmitting} onClick={onClose}>
          {t('Cancel')}
        </Button>
      </FlightCtlActionGroup>
    </Form>
  );
};

type CreateRepositoryFormProps = {
  onClose: VoidFunction;
  onSuccess: (repository: Repository) => void;
  repository?: Repository;
  resourceSyncs?: ResourceSync[];
  hideResourceSyncs?: boolean;
};

const CreateRepositoryForm: React.FC<CreateRepositoryFormProps> = ({
  repository,
  resourceSyncs,
  hideResourceSyncs,
  onClose,
  onSuccess,
}) => {
  const [errors, setErrors] = React.useState<string[]>();
  const { put, remove, post } = useFetch();
  const { t } = useTranslation();

  return (
    <Formik<RepositoryFormValues>
      initialValues={getInitValues(repository, resourceSyncs, hideResourceSyncs)}
      validationSchema={Yup.lazy(repositorySchema(t, repository))}
      validateOnChange={false}
      onSubmit={async (values) => {
        setErrors(undefined);
        if (repository) {
          try {
            if (shouldUpdateRepositoryDetails(values, repository)) {
              await put<Repository>(`repositories/${repository.metadata.name}`, getRepository(values));
            }
            if (values.useResourceSyncs) {
              const storedRSs = resourceSyncs || [];
              const rsToRemovePromises = storedRSs
                .filter((storedRs) => !values.resourceSyncs.some((formRs) => formRs.name === storedRs.metadata.name))
                .map((rs) => remove(`resourcesyncs/${rs.metadata.name}`));

              const rsToAddPromises = values.resourceSyncs
                .filter((formRs) => !storedRSs.some((r) => r.metadata.name === formRs.name))
                .map((rs) => post<ResourceSync>('resourcesyncs', getResourceSync(values.name, rs)));

              const rsToUpdatePromises = values.resourceSyncs
                .filter((formRs) => {
                  const resourceSync = storedRSs.find((storedRs) => storedRs.metadata.name === formRs.name);
                  return (
                    resourceSync &&
                    (resourceSync.spec.path !== formRs.path ||
                      resourceSync.spec.targetRevision !== formRs.targetRevision)
                  );
                })
                .map((rs) => put<ResourceSync>(`resourcesyncs/${rs.name}`, getResourceSync(values.name, rs)));

              const errors = await handlePromises([...rsToRemovePromises, ...rsToAddPromises, ...rsToUpdatePromises]);
              if (errors.length) {
                setErrors(errors);
                return;
              }
            } else if (resourceSyncs?.length) {
              const resourceSyncPromises = resourceSyncs.map((rs) => remove(`resourcesyncs/${rs.metadata.name}`));

              const errors = await handlePromises(resourceSyncPromises);
              if (errors.length) {
                setErrors(errors);
                return;
              }
            }
            onSuccess(repository);
          } catch (e) {
            setErrors([getErrorMessage(e)]);
          }
        } else {
          try {
            const repo = await post<Repository>('repositories', getRepository(values));
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
            onSuccess(repo);
          } catch (e) {
            setErrors([getErrorMessage(e)]);
          }
        }
      }}
    >
      <CreateRepositoryFormContent isEdit={!!repository} hideResourceSyncs={hideResourceSyncs} onClose={onClose}>
        {errors?.length && (
          <Alert isInline variant="danger" title={t('An error occurred')}>
            {errors.map((e, index) => (
              <div key={index}>{e}</div>
            ))}
          </Alert>
        )}
        <LeaveFormConfirmation />
      </CreateRepositoryFormContent>
    </Formik>
  );
};
export default CreateRepositoryForm;
