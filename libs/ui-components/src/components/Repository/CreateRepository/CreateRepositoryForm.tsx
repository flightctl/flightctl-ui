import * as React from 'react';
import {
  Alert,
  Button,
  ButtonVariant,
  Checkbox,
  FormGroup,
  FormSection,
  Grid,
  Modal,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { Trans } from 'react-i18next';

import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import FlightCtlActionGroup from '../../form/FlightCtlActionGroup';
import { RepositoryFormValues } from './types';
import CreateResourceSyncsForm from './CreateResourceSyncsForm';

import {
  getInitValues,
  getRepository,
  getRepositoryPatches,
  getResourceSync,
  getResourceSyncEditPatch,
  handlePromises,
  repositorySchema,
} from './utils';
import { RepoSpecType, Repository, ResourceSync } from '@flightctl/types';
import { getErrorMessage } from '../../../utils/error';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';
import WithHelperText from '../../common/WithHelperText';
import NameField from '../../form/NameField';
import TextAreaField from '../../form/TextAreaField';
import CheckboxField from '../../form/CheckboxField';
import RadioField from '../../form/RadioField';
import TextField from '../../form/TextField';
import FlightCtlForm from '../../form/FlightCtlForm';

import { getDnsSubdomainValidations } from '../../form/validations';

import './CreateRepositoryForm.css';

const AdvancedSection = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<RepositoryFormValues>();
  const showConfigTypeRadios = values.repoType === RepoSpecType.GIT;

  return (
    <FormSection>
      {showConfigTypeRadios && (
        <Split hasGutter>
          <SplitItem>
            <RadioField id="http-config-radio" name="configType" label={t('HTTP')} checkedValue="http" />
          </SplitItem>
          <SplitItem>
            <RadioField id="ssh-config-radio" name="configType" label={t('SSH')} checkedValue="ssh" />
          </SplitItem>
        </Split>
      )}
      {values.configType === 'http' && (
        <Grid hasGutter className={showConfigTypeRadios ? 'fctl-create-repo__adv-section--nested' : ''}>
          {values.repoType === RepoSpecType.HTTP && (
            <FormSection>
              <FormGroup
                label={t('Validation suffix')}
                labelIcon={
                  <WithHelperText
                    ariaLabel={t('Validation suffix')}
                    content={t(
                      "Suffix to the repository's base URL used to validate if the HTTP service is accessible.",
                    )}
                  />
                }
              >
                <TextField
                  aria-label={t('Validation suffix')}
                  name="validationSuffix"
                  helperText={
                    values.validationSuffix &&
                    values.url && (
                      <Trans t={t}>
                        Full validation URL: <strong>{`${values.url}${values.validationSuffix || ''}`}</strong>
                      </Trans>
                    )
                  }
                />
              </FormGroup>
            </FormSection>
          )}

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
          {values.repoType === RepoSpecType.HTTP && (
            <FormGroup
              label={
                <WithHelperText
                  content={t('JWT authentication token for the HTTP service')}
                  ariaLabel={t('Token')}
                  showLabel
                />
              }
            >
              <TextField name="httpConfig.token" aria-label={t('Token')} />
            </FormGroup>
          )}
        </Grid>
      )}
      {values.configType === 'ssh' && (
        <Grid hasGutter className={showConfigTypeRadios ? 'fctl-create-repo__adv-section--nested' : ''}>
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

const RepositoryType = ({ isEdit }: { isEdit?: boolean }) => {
  const { t } = useTranslation();
  const { values, setFieldValue, validateForm } = useFormikContext<RepositoryFormValues>();
  const [showConfirmChangeType, setShowConfirmChangeType] = React.useState<boolean>();

  if (!values.showRepoTypes) {
    return null;
  }

  const isRepoTypeChangeDisabled = values.allowedRepoTypes?.length === 1;

  const doChangeRepoType = (toType?: RepoSpecType) => {
    if (!toType) {
      toType = values.repoType === RepoSpecType.GIT ? RepoSpecType.HTTP : RepoSpecType.GIT;
    }
    if (toType === RepoSpecType.HTTP) {
      void setFieldValue('repoType', RepoSpecType.HTTP);
      void setFieldValue('configType', 'http');
      void setFieldValue('useResourceSyncs', false);
    } else {
      void setFieldValue('repoType', RepoSpecType.GIT);
      void setFieldValue('httpConfig.token', undefined);
    }
    void validateForm();
  };

  const onRepoTypeChange = (repoType: unknown) => {
    if (isEdit) {
      setShowConfirmChangeType(true);
    } else {
      doChangeRepoType(repoType as RepoSpecType);
    }
  };

  return (
    <>
      <Split hasGutter>
        <SplitItem>
          <RadioField
            id="git-repo-radio"
            name="repoType"
            label={t('Use Git repository')}
            checkedValue={RepoSpecType.GIT}
            onChangeCustom={onRepoTypeChange}
            noDefaultOnChange
            isDisabled={isRepoTypeChangeDisabled}
          />
        </SplitItem>
        <SplitItem>
          <RadioField
            id="http-repo-radio"
            name="repoType"
            label={t('Use HTTP service')}
            checkedValue={RepoSpecType.HTTP}
            onChangeCustom={onRepoTypeChange}
            noDefaultOnChange
            isDisabled={isRepoTypeChangeDisabled}
          />
        </SplitItem>
      </Split>
      {showConfirmChangeType && (
        <Modal
          title={'Change repository type?'}
          titleIconVariant="warning"
          variant="small"
          isOpen
          actions={[
            <Button
              key="change"
              variant={ButtonVariant.primary}
              onClick={() => {
                setShowConfirmChangeType(false);
                doChangeRepoType();
              }}
            >
              {t('Change')}
            </Button>,
            <Button
              key="cancel"
              variant="link"
              onClick={() => {
                setShowConfirmChangeType(false);
              }}
            >
              {t('Cancel')}
            </Button>,
          ]}
        >
          {t('Switching the repository type will cause some data to be lost.')}
          {t('Are you sure you want to change the repository type?')}
        </Modal>
      )}
    </>
  );
};

export const RepositoryForm = ({ isEdit }: { isEdit?: boolean }) => {
  const { t } = useTranslation();

  return (
    <>
      <NameField
        name="name"
        aria-label={t('Repository name')}
        isRequired
        isDisabled={isEdit}
        resourceType="repositories"
        validations={getDnsSubdomainValidations(t)}
      />
      <FormGroup label={t('Repository URL')} isRequired>
        <TextField
          name="url"
          aria-label={t('Repository URL')}
          helperText={t('For example: https://github.com/flightctl/flightctl-demos')}
        />
      </FormGroup>

      <RepositoryType isEdit={isEdit} />
      <CheckboxField name="useAdvancedConfig" label={t('Use advanced configurations')} body={<AdvancedSection />} />
    </>
  );
};

type CreateRepositoryFormContentProps = React.PropsWithChildren<Record<never, never>> &
  Pick<CreateRepositoryFormProps, 'onClose'> & {
    isEdit: boolean;
    isReadOnly: boolean;
  };

const CreateRepositoryFormContent = ({ isEdit, isReadOnly, onClose, children }: CreateRepositoryFormContentProps) => {
  const { t } = useTranslation();
  const { values, setFieldValue, isValid, dirty, submitForm, isSubmitting } = useFormikContext<RepositoryFormValues>();
  const isSubmitDisabled = isSubmitting || !dirty || !isValid;

  const showResourceSyncs = values.canUseResourceSyncs && values.repoType === RepoSpecType.GIT;
  return (
    <FlightCtlForm className="fctl-create-repo">
      <fieldset disabled={isReadOnly}>
        <Grid hasGutter span={8}>
          <RepositoryForm isEdit={isEdit} />
          {showResourceSyncs && (
            <Checkbox
              id="use-resource-syncs"
              label={
                <WithHelperText
                  showLabel
                  ariaLabel={t('Use resource syncs')}
                  content={t(
                    "A resource sync is an automated Gitops way to manage imported fleets. The resource sync monitors changes made to the source repository and update the fleet's configurations accordingly.",
                  )}
                />
              }
              isChecked={values.useResourceSyncs}
              onChange={(_, checked) => {
                // Trigger validation of the resource syncs items
                return setFieldValue('useResourceSyncs', checked, true);
              }}
              body={values.useResourceSyncs && <CreateResourceSyncsForm />}
            />
          )}
        </Grid>
      </fieldset>
      {children}
      <FlightCtlActionGroup>
        <Button variant="primary" onClick={submitForm} isLoading={isSubmitting} isDisabled={isSubmitDisabled}>
          {isEdit ? t('Save') : t('Create repository')}
        </Button>
        <Button variant="link" isDisabled={isSubmitting} onClick={onClose}>
          {t('Cancel')}
        </Button>
      </FlightCtlActionGroup>
    </FlightCtlForm>
  );
};

export type CreateRepositoryFormProps = {
  onClose: VoidFunction;
  onSuccess: (repository: Repository) => void;
  repository?: Repository;
  resourceSyncs?: ResourceSync[];
  options?: {
    isReadOnly?: boolean;
    canUseResourceSyncs?: boolean;
    showRepoTypes?: boolean;
    allowedRepoTypes?: RepoSpecType[];
  };
};

const CreateRepositoryForm: React.FC<CreateRepositoryFormProps> = ({
  repository,
  resourceSyncs,
  options,
  onClose,
  onSuccess,
}) => {
  const [errors, setErrors] = React.useState<string[]>();
  const { patch, remove, post } = useFetch();
  const { t } = useTranslation();
  return (
    <Formik<RepositoryFormValues>
      initialValues={getInitValues({
        repository,
        resourceSyncs,
        options,
      })}
      validationSchema={Yup.lazy(repositorySchema(t, repository))}
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
                .map((rs) => patch<ResourceSync>(`resourcesyncs/${rs.name}`, getResourceSyncEditPatch(rs)));

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
      <CreateRepositoryFormContent isEdit={!!repository} onClose={onClose} isReadOnly={!!options?.isReadOnly}>
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
