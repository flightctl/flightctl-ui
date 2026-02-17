import * as React from 'react';
import {
  ActionGroup,
  Alert,
  Button,
  ButtonVariant,
  Checkbox,
  FormGroup,
  FormSection,
  Grid,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Split,
  SplitItem,
} from '@patternfly/react-core';

import { Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { Trans } from 'react-i18next';

import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
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
import { OciRepoSpec, RepoSpecType, Repository, ResourceSync } from '@flightctl/types';
import { getErrorMessage } from '../../../utils/error';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';
import LabelWithHelperText, { FormGroupWithHelperText } from '../../common/WithHelperText';
import NameField from '../../form/NameField';
import TextAreaField from '../../form/TextAreaField';
import CheckboxField from '../../form/CheckboxField';
import RadioField from '../../form/RadioField';
import TextField from '../../form/TextField';
import FlightCtlForm from '../../form/FlightCtlForm';
import { getDnsSubdomainValidations } from '../../form/validations';
import { DEMO_REPOSITORY_URL } from '../../../hooks/useAppLinks';
import { usePermissionsContext } from '../../common/PermissionsContext';
import { RESOURCE, VERB } from '../../../types/rbac';

import './CreateRepositoryForm.css';

const AdvancedSection = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<RepositoryFormValues>();
  const showConfigTypeRadios = values.repoType === RepoSpecType.RepoSpecTypeGit;
  const isOciRepo = values.repoType === RepoSpecType.RepoSpecTypeOci;

  if (isOciRepo) {
    return (
      <FormSection>
        <Grid hasGutter>
          <CheckboxField
            name="ociConfig.ociAuth.use"
            label={t('Basic authentication')}
            body={
              <>
                <FormGroup label={t('Username')} isRequired>
                  <TextField name="ociConfig.ociAuth.username" aria-label={t('Username')} />
                </FormGroup>
                <FormGroup label={t('Password')} isRequired>
                  <TextField name="ociConfig.ociAuth.password" aria-label={t('Password')} type="password" />
                </FormGroup>
              </>
            }
          />
          <FormGroup>
            <CheckboxField name="ociConfig.skipServerVerification" label={t('Skip server verification')} />
          </FormGroup>
          <FormGroup label={t('CA certificate')}>
            <TextAreaField
              name="ociConfig.caCrt"
              aria-label={t('CA certificate')}
              isDisabled={values.ociConfig?.skipServerVerification}
            />
          </FormGroup>
        </Grid>
      </FormSection>
    );
  }

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
          {values.repoType === RepoSpecType.RepoSpecTypeHttp && (
            <FormSection>
              <FormGroupWithHelperText
                label={t('Validation suffix')}
                content={t("Suffix to the repository's base URL used to validate if the HTTP service is accessible.")}
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
              </FormGroupWithHelperText>
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
          {values.repoType === RepoSpecType.RepoSpecTypeHttp && (
            <FormGroupWithHelperText content={t('JWT authentication token for the HTTP service')} label={t('Token')}>
              <TextField name="httpConfig.token" aria-label={t('Token')} />
            </FormGroupWithHelperText>
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
  const [showConfirmChangeType, setShowConfirmChangeType] = React.useState<RepoSpecType | undefined>();

  if (!values.showRepoTypes) {
    return null;
  }

  const isRepoTypeChangeDisabled = values.allowedRepoTypes?.length === 1;

  const doChangeRepoType = (toType: RepoSpecType) => {
    if (toType === RepoSpecType.RepoSpecTypeGit) {
      void setFieldValue('repoType', RepoSpecType.RepoSpecTypeGit);
      void setFieldValue('httpConfig.token', undefined);
      void setFieldValue('canUseResourceSyncs', true);
    }

    if (toType === RepoSpecType.RepoSpecTypeHttp) {
      void setFieldValue('repoType', RepoSpecType.RepoSpecTypeHttp);
      void setFieldValue('configType', 'http');
      void setFieldValue('useResourceSyncs', false);
      void setFieldValue('canUseResourceSyncs', false);
    }

    if (toType === RepoSpecType.RepoSpecTypeOci) {
      void setFieldValue('repoType', RepoSpecType.RepoSpecTypeOci);
      void setFieldValue('useResourceSyncs', false);
      void setFieldValue('canUseResourceSyncs', false);
      if (!values.ociConfig) {
        void setFieldValue('ociConfig', {
          registry: '',
          scheme: OciRepoSpec.scheme.HTTPS,
          accessMode: OciRepoSpec.accessMode.READ,
        });
      }
    }
    void validateForm();
  };

  const onRepoTypeChange = (type: unknown) => {
    const repoType = type as RepoSpecType;
    if (isEdit) {
      setShowConfirmChangeType(repoType);
    } else {
      doChangeRepoType(repoType);
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
            checkedValue={RepoSpecType.RepoSpecTypeGit}
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
            checkedValue={RepoSpecType.RepoSpecTypeHttp}
            onChangeCustom={onRepoTypeChange}
            noDefaultOnChange
            isDisabled={isRepoTypeChangeDisabled}
          />
        </SplitItem>
        <SplitItem>
          <RadioField
            id="oci-repo-radio"
            name="repoType"
            label={t('Use OCI registry')}
            checkedValue={RepoSpecType.RepoSpecTypeOci}
            onChangeCustom={onRepoTypeChange}
            noDefaultOnChange
            isDisabled={isRepoTypeChangeDisabled}
          />
        </SplitItem>
      </Split>
      {showConfirmChangeType && (
        <Modal variant="small" isOpen>
          <ModalHeader title={'Change repository type?'} titleIconVariant="warning" />
          <ModalBody>
            {t('Switching the repository type will cause some data to be lost.')}{' '}
            {t('Are you sure you want to change the repository type?')}
          </ModalBody>
          <ModalFooter>
            <Button
              key="change"
              variant={ButtonVariant.primary}
              onClick={() => {
                setShowConfirmChangeType(undefined);
                doChangeRepoType(showConfirmChangeType);
              }}
            >
              {t('Change')}
            </Button>
            <Button
              key="cancel"
              variant="link"
              onClick={() => {
                setShowConfirmChangeType(undefined);
              }}
            >
              {t('Cancel')}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
};

export const RepositoryForm = ({ isEdit }: { isEdit?: boolean }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<RepositoryFormValues>();
  const isOciRepo = values.repoType === RepoSpecType.RepoSpecTypeOci;

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
      {isOciRepo ? (
        <FormGroup label={t('Registry hostname')} isRequired>
          <TextField
            name="ociConfig.registry"
            aria-label={t('Registry hostname')}
            helperText={t('For example: quay.io, registry.redhat.io, myregistry.com:5000')}
          />
        </FormGroup>
      ) : (
        <FormGroup label={t('Repository URL')} isRequired>
          <TextField
            name="url"
            aria-label={t('Repository URL')}
            helperText={t('For example: {{ demoRepositoryUrl }}', { demoRepositoryUrl: DEMO_REPOSITORY_URL })}
          />
        </FormGroup>
      )}

      <RepositoryType isEdit={isEdit} />
      {isOciRepo && (
        <FormSection>
          <FormGroup label={t('Scheme')}>
            <Split hasGutter>
              <SplitItem>
                <RadioField
                  id="oci-scheme-https"
                  name="ociConfig.scheme"
                  label={t('HTTPS')}
                  checkedValue={OciRepoSpec.scheme.HTTPS}
                />
              </SplitItem>
              <SplitItem>
                <RadioField
                  id="oci-scheme-http"
                  name="ociConfig.scheme"
                  label={t('HTTP')}
                  checkedValue={OciRepoSpec.scheme.HTTP}
                />
              </SplitItem>
            </Split>
          </FormGroup>
          <FormGroup label={t('Access mode')}>
            <Split hasGutter>
              <SplitItem>
                <RadioField
                  id="oci-access-read"
                  name="ociConfig.accessMode"
                  label={t('Read only')}
                  checkedValue={OciRepoSpec.accessMode.READ}
                />
              </SplitItem>
              <SplitItem>
                <RadioField
                  id="oci-access-readwrite"
                  name="ociConfig.accessMode"
                  label={t('Read and write')}
                  checkedValue={OciRepoSpec.accessMode.READ_WRITE}
                />
              </SplitItem>
            </Split>
          </FormGroup>
        </FormSection>
      )}
      <CheckboxField name="useAdvancedConfig" label={t('Use advanced configurations')} body={<AdvancedSection />} />
    </>
  );
};

type CreateRepositoryFormContentProps = React.PropsWithChildren &
  Pick<CreateRepositoryFormProps, 'onClose'> & {
    isEdit: boolean;
    isReadOnly: boolean;
  };

const CreateRepositoryFormContent = ({ isEdit, isReadOnly, onClose, children }: CreateRepositoryFormContentProps) => {
  const { t } = useTranslation();
  const { values, setFieldValue, isValid, dirty, submitForm, isSubmitting } = useFormikContext<RepositoryFormValues>();
  const isSubmitDisabled = isSubmitting || !dirty || !isValid;

  const { checkPermissions } = usePermissionsContext();
  const [canCreateRS] = checkPermissions([{ kind: RESOURCE.RESOURCE_SYNC, verb: VERB.CREATE }]);

  const showResourceSyncs = values.canUseResourceSyncs && values.repoType === RepoSpecType.RepoSpecTypeGit;
  return (
    <FlightCtlForm className="fctl-create-repo">
      <fieldset disabled={isReadOnly}>
        <Grid hasGutter span={8}>
          <RepositoryForm isEdit={isEdit} />
          {showResourceSyncs && canCreateRS && (
            <Checkbox
              id="use-resource-syncs"
              className="fctl-create-repo__rs-checkbox"
              label={
                <LabelWithHelperText
                  label={t('Use resource syncs')}
                  content={t(
                    'A resource sync is an automated Gitops method that helps manage your imported fleets by monitoring source repository changes and updating your fleet configuration accordingly.',
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
      <ActionGroup>
        <Button variant="primary" onClick={submitForm} isLoading={isSubmitting} isDisabled={isSubmitDisabled}>
          {isEdit ? t('Save') : t('Create repository')}
        </Button>
        <Button variant="link" isDisabled={isSubmitting} onClick={onClose}>
          {t('Cancel')}
        </Button>
      </ActionGroup>
    </FlightCtlForm>
  );
};

export type CreateRepositoryFormProps = {
  onClose: VoidFunction;
  onSuccess: (repository: Repository) => void;
  repository?: Repository;
  resourceSyncs?: ResourceSync[];
  // If provided, the repository submission will be blocked if the validation fails
  validateBefore?: (repo: Repository) => string | undefined;
  options?: {
    isReadOnly?: boolean;
    canUseResourceSyncs?: boolean;
    showRepoTypes?: boolean;
    allowedRepoTypes?: RepoSpecType[];
  };
};

const CreateRepositoryForm = ({
  repository,
  resourceSyncs,
  validateBefore,
  options,
  onClose,
  onSuccess,
}: CreateRepositoryFormProps) => {
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
          const specPatches = getRepositoryPatches(values, repository);
          try {
            if (specPatches.length) {
              await patch<Repository>(`repositories/${repository.metadata.name}`, specPatches);
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
          const repoToCreate = getRepository(values);
          const validationError = validateBefore?.(repoToCreate);
          if (validationError) {
            setErrors([validationError]);
            return;
          }
          try {
            const repo = await post<Repository>('repositories', repoToCreate);
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
          <Alert isInline variant="danger" title={t('Repository could not be saved')}>
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
