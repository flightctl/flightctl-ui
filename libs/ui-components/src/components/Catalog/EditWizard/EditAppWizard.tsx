import { Wizard, WizardStep, WizardStepType } from '@patternfly/react-core';
import * as React from 'react';
import { CatalogItem, CatalogItemVersion } from '@flightctl/types/alpha';
import { Formik, FormikErrors, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { RJSFValidationError } from '@rjsf/utils';
import { ApplicationProviderSpec } from '@flightctl/types';
import semver from 'semver';

import { useTranslation } from '../../../hooks/useTranslation';
import { getInitialAppConfig } from '../InstallWizard/utils';
import AppConfigStep, { isAppConfigStepValid } from '../InstallWizard/steps/AppConfigStep';
import FlightCtlWizardFooter from '../../common/FlightCtlWizardFooter';
import { useSubmitCatalogForm } from '../useSubmitCatalogForm';
import { getUpdates } from '../utils';
import { AppUpdateFormik } from './types';
import UpdateStep, { isUpdateStepValid } from './steps/UpdateStep';
import ReviewStep from './steps/ReviewStep';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';
import { validApplicationAndVolumeName } from '../../form/validations';

const versionStepId = 'version-step';
const configStepId = 'config-step';
const reviewStepId = 'review-step';

const validateUpdateWizardStep = (
  activeStepId: string,
  errors: FormikErrors<AppUpdateFormik>,
  values: AppUpdateFormik,
) => {
  if (activeStepId === versionStepId) return isUpdateStepValid(errors);
  if (activeStepId === configStepId) return isAppConfigStepValid(values, errors);
  return true;
};

type WizardContentProps = {
  currentVersion: CatalogItemVersion;
  appSpec?: ApplicationProviderSpec;
  catalogItem: CatalogItem;
  error: string | undefined;
  schemaErrors: RJSFValidationError[] | undefined;
  setError: (err: string | undefined) => void;
};

const WizardContent: React.FC<WizardContentProps> = ({
  currentVersion,
  appSpec,
  catalogItem,
  error,
  schemaErrors,
  setError,
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();

  const { values, errors } = useFormikContext<AppUpdateFormik>();

  const isVersionStepValid = !!values.version;
  const isConfigStepValid = isAppConfigStepValid(values, errors);

  return (
    <>
      <LeaveFormConfirmation />
      <Wizard
        footer={
          <FlightCtlWizardFooter<AppUpdateFormik>
            firstStepId={versionStepId}
            submitStepId={reviewStepId}
            validateStep={(activeStepId, errors, values) => validateUpdateWizardStep(activeStepId, errors, values)}
            saveButtonText={appSpec ? t('Update') : t('Deploy')}
          />
        }
        onStepChange={(_, step) => {
          if (error) {
            setError(undefined);
          }
          setCurrentStep(step);
        }}
      >
        <WizardStep name={t('Version')} id={versionStepId}>
          {(!currentStep || currentStep?.id === versionStepId) && (
            <UpdateStep catalogItem={catalogItem} currentVersion={currentVersion} isEdit={!!appSpec} />
          )}
        </WizardStep>
        <WizardStep name={t('Configuration')} id={configStepId} isDisabled={!isVersionStepValid}>
          {currentStep?.id === configStepId && <AppConfigStep isEdit={!!appSpec} />}
        </WizardStep>
        <WizardStep
          name={t('Review and deploy')}
          id={reviewStepId}
          isDisabled={!isVersionStepValid || !isConfigStepValid}
        >
          {currentStep?.id === reviewStepId && (
            <ReviewStep error={error} schemaErrors={schemaErrors} isEdit={!!appSpec} />
          )}
        </WizardStep>
      </Wizard>
    </>
  );
};

type EditAppWizardProps = {
  catalogItem: CatalogItem;
  currentVersion: CatalogItemVersion;
  onUpdate: (catalogItemVersion: CatalogItemVersion, values: AppUpdateFormik) => Promise<void>;
  currentChannel: string;
  appSpec?: ApplicationProviderSpec;
  currentLabels: Record<string, string> | undefined;
  currentApps: ApplicationProviderSpec[] | undefined;
  version: string;
  channel: string;
};

const EditAppWizard: React.FC<EditAppWizardProps> = ({
  catalogItem,
  currentVersion,
  onUpdate,
  currentChannel,
  appSpec,
  currentLabels,
  currentApps,
  version,
  channel,
}) => {
  const { t } = useTranslation();

  const latestVersion = getUpdates(catalogItem, currentChannel, currentVersion.version).sort((a, b) =>
    semver.rcompare(a.version, b.version),
  )[0]?.version;
  const appVersion = appSpec ? latestVersion || currentVersion.version : version;
  const appConfig = getInitialAppConfig(catalogItem, appVersion, appSpec, currentLabels);

  const validationSchema = Yup.object({
    version: Yup.string().required(t('Version must be selected')),
    appName: appSpec
      ? Yup.string()
      : validApplicationAndVolumeName(t)
          .required(t('Application name is required'))
          .test('is-unique', t('Application with the same name already exists.'), (value) => {
            if (!value || value.length === 0) {
              return true;
            }
            if (!currentApps?.length) {
              return true;
            }
            return !currentApps.some((app) => app.name === value);
          }),
  });

  const { onSubmit, error, schemaErrors, setError } = useSubmitCatalogForm<AppUpdateFormik>(async (values) => {
    const catalogItemVersion = catalogItem.spec.versions.find((v) => v.version === values.version);
    if (!catalogItemVersion) {
      throw new Error(t('Version {{version}} not found', { version: values.version }));
    }
    await onUpdate(catalogItemVersion, values);
  });

  return (
    <Formik<AppUpdateFormik>
      validationSchema={validationSchema}
      initialValues={{
        version: appVersion,
        channel: appSpec ? currentChannel : channel,
        ...appConfig,
      }}
      validateOnMount
      onSubmit={onSubmit}
    >
      <WizardContent
        currentVersion={currentVersion}
        appSpec={appSpec}
        catalogItem={catalogItem}
        error={error}
        schemaErrors={schemaErrors}
        setError={setError}
      />
    </Formik>
  );
};

export default EditAppWizard;
