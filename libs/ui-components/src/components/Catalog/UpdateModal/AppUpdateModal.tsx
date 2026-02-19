import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  FormGroup,
  List,
  ListItem,
  Modal,
  Stack,
  StackItem,
  Title,
  Wizard,
  WizardHeader,
  WizardStep,
} from '@patternfly/react-core';
import * as React from 'react';
import { CatalogItem, CatalogItemVersion } from '@flightctl/types/alpha';
import { Formik, FormikErrors, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { RJSFValidationError } from '@rjsf/utils';
import { ApplicationProviderSpec } from '@flightctl/types';

import { useTranslation } from '../../../hooks/useTranslation';
import UpdateGraph from './UpdateGraph';
import { applyInitialConfig, getInitialAppConfig } from '../InstallWizard/utils';
import { DynamicFormConfigFormik, InstallAppFormik } from '../InstallWizard/types';
import { DynamicAppForm, isAppConfigStepValid } from '../InstallWizard/steps/AppConfigStep';
import FlightCtlForm from '../../form/FlightCtlForm';
import FlightCtlWizardFooter from '../../common/FlightCtlWizardFooter';
import { useSubmit } from '../useSubmit';

const versionStepId = 'version-step';
const configStepId = 'config-step';
const reviewStepId = 'review-step';

const validateUpdateWizardStep = (
  activeStepId: string,
  errors: FormikErrors<AppUpdateFormik>,
  values: AppUpdateFormik,
  initialValues: AppUpdateFormik,
) => {
  if (activeStepId === versionStepId) return !!values.version && values.version !== initialValues.version;
  if (activeStepId === configStepId) return isAppConfigStepValid(values, errors);
  return true;
};

type AppUpdateModalContentProps = {
  currentVersion: CatalogItemVersion;
  onClose: VoidFunction;
  updates: CatalogItemVersion[];
  appSpec: ApplicationProviderSpec;
  catalogItem: CatalogItem;
  error: string | undefined;
  schemaErrors: RJSFValidationError[] | undefined;
};

const AppUpdateModalContent: React.FC<AppUpdateModalContentProps> = ({
  onClose,
  updates,
  currentVersion,
  appSpec,
  catalogItem,
  error,
  schemaErrors,
}) => {
  const { t } = useTranslation();
  const { values, initialValues, errors, setFieldValue } = useFormikContext<AppUpdateFormik>();

  const isVersionStepValid = !!values.version && values.version !== initialValues.version;
  const isConfigStepValid = isAppConfigStepValid(
    values as unknown as InstallAppFormik,
    errors as FormikErrors<InstallAppFormik>,
  );

  return (
    <Modal isOpen variant="large">
      <Wizard
        height={800}
        onClose={onClose}
        title={t('Update application')}
        header={<WizardHeader onClose={onClose} title={t('Update application')} />}
        footer={
          <FlightCtlWizardFooter<AppUpdateFormik>
            firstStepId={versionStepId}
            submitStepId={reviewStepId}
            validateStep={(activeStepId, errors, values) =>
              validateUpdateWizardStep(activeStepId, errors, values, initialValues)
            }
            saveButtonText={t('Update')}
            onCancel={onClose}
          />
        }
      >
        <WizardStep name={t('Version')} id={versionStepId}>
          <FlightCtlForm>
            <FormGroup label={t('Select new version')} isRequired>
              <div style={{ height: '400px' }}>
                <UpdateGraph
                  selectedNodeId={values.version}
                  currentVersion={currentVersion}
                  currentChannel={initialValues.channel}
                  onSelectionChange={(version) => {
                    const appConfig = getInitialAppConfig(catalogItem, version, appSpec);
                    applyInitialConfig(setFieldValue, appConfig);
                    setFieldValue('version', version);
                  }}
                  updates={updates}
                />
              </div>
            </FormGroup>
          </FlightCtlForm>
        </WizardStep>
        <WizardStep name={t('Configuration')} id={configStepId} isDisabled={!isVersionStepValid}>
          <FlightCtlForm>
            <DynamicAppForm isInModal isEdit={true} schemaErrors={schemaErrors} />
          </FlightCtlForm>
        </WizardStep>
        <WizardStep name={t('Review')} id={reviewStepId} isDisabled={!isVersionStepValid || !isConfigStepValid}>
          <FlightCtlForm>
            <Stack hasGutter>
              <StackItem>
                <Title headingLevel="h3">{t('Review update')}</Title>
              </StackItem>
              <StackItem>
                <Card>
                  <CardTitle>{t('Update specifications')}</CardTitle>
                  <CardBody>
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Channel')}</DescriptionListTerm>
                        <DescriptionListDescription>{values.channel}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{t('Version')}</DescriptionListTerm>
                        <DescriptionListDescription>{values.version}</DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </CardBody>
                </Card>
              </StackItem>
              {error && (
                <StackItem>
                  <Alert variant="danger" title={t('Failed to update application')} isInline>
                    {error}
                  </Alert>
                </StackItem>
              )}
              {!!schemaErrors?.length && (
                <StackItem>
                  <Alert variant="danger" title={t('Configuration is not valid')} isInline>
                    <List>
                      {schemaErrors.map((e, index) => (
                        <ListItem key={index}>
                          {e.property}: {e.message}
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                </StackItem>
              )}
            </Stack>
          </FlightCtlForm>
        </WizardStep>
      </Wizard>
    </Modal>
  );
};

type AppUpdateFormik = DynamicFormConfigFormik & {
  version: string;
  channel: string;
};

type AppUpdateModalProps = {
  catalogItem: CatalogItem;
  onClose: VoidFunction;
  currentVersion: CatalogItemVersion;
  updates: CatalogItemVersion[];
  onUpdate: (selectedEntry: string, channel: string, values: AppUpdateFormik) => Promise<void>;
  currentChannel: string;
  appSpec: ApplicationProviderSpec;
  exisingLabels: Record<string, string> | undefined;
};

const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  catalogItem,
  onClose,
  currentVersion,
  onUpdate,
  currentChannel,
  updates,
  appSpec,
  exisingLabels,
}) => {
  const { t } = useTranslation();

  const appConfig = getInitialAppConfig(catalogItem, currentVersion.version, appSpec, exisingLabels);

  const validationSchema = Yup.object({
    version: Yup.string().required(t('Version must be selected')),
  });

  const { onSubmit, error, schemaErrors } = useSubmit<AppUpdateFormik>({
    onUpdate: async (values) => {
      await onUpdate(values.version, currentChannel, values);
    },
  });

  return (
    <Formik<AppUpdateFormik>
      validationSchema={validationSchema}
      initialValues={{
        version: currentVersion.version,
        channel: currentChannel,
        ...appConfig,
      }}
      validateOnMount
      onSubmit={async (values) => {
        const success = await onSubmit(values);
        if (success) {
          onClose();
        }
      }}
    >
      <AppUpdateModalContent
        updates={updates}
        onClose={onClose}
        currentVersion={currentVersion}
        appSpec={appSpec}
        catalogItem={catalogItem}
        error={error}
        schemaErrors={schemaErrors}
      />
    </Formik>
  );
};

export default AppUpdateModal;
