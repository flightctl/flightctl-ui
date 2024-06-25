import * as React from 'react';
import { Alert, Button, Checkbox, Form, FormGroup, FormSection, Grid, Split, SplitItem } from '@patternfly/react-core';
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
  getRepositoryPatches,
  getResourceSync,
  handlePromises,
  repositorySchema,
} from './utils';
import { Repository, ResourceSync } from '@flightctl/types';
import { getErrorMessage } from '../../../utils/error';
import NameField from '../../form/NameField';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';
import TextAreaField from '../../form/TextAreaField';
import CheckboxField from '../../form/CheckboxField';
import RadioField from '../../form/RadioField';

import './CreateRepositoryForm.css';

const AdvancedSection = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<RepositoryFormValues>();

  return (
    <FormSection>
      <Split hasGutter>
        <SplitItem>
          <RadioField id="http-radio" name="configType" label="HTTP" checkedValue="http" />
        </SplitItem>
        <SplitItem>
          <RadioField id="ssh-radio" name="configType" label="SSH" checkedValue="ssh" />
        </SplitItem>
      </Split>
      {values.configType === 'http' && (
        <Grid hasGutter className="fctl-create-repo__adv-section">
          <CheckboxField name="httpConfig.basicAuth.use" label={t('Basic authentication')}>
            <FormGroup label={t('Username')} isRequired>
              <TextField name="httpConfig.basicAuth.username" aria-label={t('Username')} />
            </FormGroup>
            <FormGroup label={t('Password')} isRequired>
              <TextField name="httpConfig.basicAuth.password" aria-label={t('Password')} type="password" />
            </FormGroup>
          </CheckboxField>
          <CheckboxField name="httpConfig.mTlsAuth.use" label={t('mTLS authentication')}>
            <FormGroup label={t('Client TLS certificate')} isRequired>
              <TextAreaField name="httpConfig.mTlsAuth.tlsCrt" aria-label={t('Client TLS certificate')} />
            </FormGroup>
            <FormGroup label={t('Client TLS key')} isRequired>
              <TextAreaField name="httpConfig.mTlsAuth.tlsKey" aria-label={t('Client TLS key')} />
            </FormGroup>
          </CheckboxField>
          <FormGroup>
            <CheckboxField name="httpConfig.skipServerVerification" label={t('Skip server verification')} />
          </FormGroup>
          <FormGroup label={t('CA certificate')}>
            <TextAreaField
              name="httpConfig.caCrt"
              aria-label={t('Username')}
              isDisabled={values.httpConfig?.skipServerVerification}
            />
          </FormGroup>
        </Grid>
      )}
      {values.configType === 'ssh' && (
        <Grid hasGutter className="fctl-create-repo__adv-section">
          <FormGroup label={t('SSH private key')}>
            <TextAreaField name="sshConfig.sshPrivateKey" aria-label={t('SSH private key')} />
          </FormGroup>
          <FormGroup label={t('Private key passphrase')}>
            <TextField name="sshConfig.privateKeyPassphrase" aria-label={t('Private key passphrase')} type="password" />
          </FormGroup>
          <FormGroup>
            <CheckboxField name="sshConfig.skipServerVerification" label={t('Skip server verification')} />
          </FormGroup>
        </Grid>
      )}
    </FormSection>
  );
};

export const RepositoryForm = ({ isEdit }: { isEdit?: boolean }) => {
  const { t } = useTranslation();

  return (
    <>
      <FormGroup label={t('Repository name')} isRequired>
        <NameField
          name="name"
          aria-label={t('Repository name')}
          isDisabled={isEdit}
          resourceType="repositories"
          getExistsErrMsg={(value) => t(`A repository named "{{value}}" already exists`, { value })}
        />
      </FormGroup>
      <FormGroup label={t('Repository URL')} isRequired>
        <TextField
          name="url"
          aria-label={t('Repository URL')}
          helperText={t('For example: https://github.com/flightctl/flightctl-demos')}
        />
      </FormGroup>
      <CheckboxField name="useAdvancedConfig" label={t('Use advanced configurations')} body={<AdvancedSection />} />
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
  const { put, remove, post, patch } = useFetch();
  const { t } = useTranslation();

  return (
    <Formik<RepositoryFormValues>
      initialValues={getInitValues(repository, resourceSyncs, hideResourceSyncs)}
      validationSchema={Yup.lazy(repositorySchema(t, repository))}
      validateOnChange={false}
      onSubmit={async (values) => {
        setErrors(undefined);
        if (repository) {
          const patches = getRepositoryPatches(values, repository);
          try {
            if (patches.length) {
              await patch<Repository>(`repositories/${repository.metadata.name}`, patches);
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
