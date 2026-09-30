import * as React from 'react';
import { Formik, type FormikErrors, useFormikContext } from 'formik';
import { Wizard, WizardStep, type WizardStepType } from '@patternfly/react-core';
import * as Yup from 'yup';
import type { RJSFValidationError } from '@rjsf/utils';

import type { ApplicationProviderSpec } from '@flightctl/types';
import type { CatalogItem, CatalogItemVersion } from '@flightctl/types/alpha';

import { useTranslation } from '../../../hooks/useTranslation';
import { getInitialAppConfig } from '../InstallWizard/utils';
import AppConfigStep, { isAppConfigStepValid } from '../InstallWizard/steps/AppConfigStep';
import FlightCtlWizardFooter from '../../common/FlightCtlWizardFooter';
import { useSubmitCatalogForm } from '../useSubmitCatalogForm';
import { type CatalogEditWizardMode, getSortedUpdates } from '../../../utils/catalog';
import { isWizardStepDisabled } from '../../../utils/wizards';
import { type AppUpdateFormik } from './types';
import UpdateStep, { isUpdateStepValid } from './steps/UpdateStep';
import ReviewStep from './steps/ReviewStep';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';
import { validApplicationAndVolumeName } from '../../form/validations';
import { isAdvancedConfigRequired } from '../../CatalogComposition/catalogCompositionUtils';

const versionStepId = 'version-step';
const configStepId = 'config-step';
const reviewStepId = 'review-step';

const getOrderedIds = (showConfigStep: boolean) =>
  showConfigStep ? [versionStepId, configStepId, reviewStepId] : [versionStepId, reviewStepId];

const getValidStepIds = (
  errors: FormikErrors<AppUpdateFormik>,
  values: AppUpdateFormik,
  showConfigStep: boolean,
): string[] => {
  const orderedIds = getOrderedIds(showConfigStep);
  const validStepIds: string[] = [];
  if (isUpdateStepValid(errors)) {
    validStepIds.push(versionStepId);
  }
  if (showConfigStep && isAppConfigStepValid(values, errors)) {
    validStepIds.push(configStepId);
  }
  if (validStepIds.length === orderedIds.length - 1) {
    validStepIds.push(reviewStepId);
  }
  return validStepIds;
};

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
  mode: CatalogEditWizardMode;
  currentVersion: CatalogItemVersion;
  appSpec?: ApplicationProviderSpec;
  catalogItem: CatalogItem;
  error: string | undefined;
  schemaErrors: RJSFValidationError[] | undefined;
  setError: (err: string | undefined) => void;
};

const WizardContent = ({
  mode,
  currentVersion,
  appSpec,
  catalogItem,
  error,
  schemaErrors,
  setError,
}: WizardContentProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();

  const { values, errors } = useFormikContext<AppUpdateFormik>();

  const isVersionStep = !currentStep || currentStep?.id === versionStepId;
  const requiresAdvancedConfig = React.useMemo(
    () => isAdvancedConfigRequired(catalogItem, values.version, appSpec),
    [catalogItem, values.version, appSpec],
  );
  const showConfigStep = requiresAdvancedConfig || values.wantAdvancedConfig;
  const orderedIds = getOrderedIds(showConfigStep);
  const validStepIds = getValidStepIds(errors, values, showConfigStep);

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
          {isVersionStep && (
            <UpdateStep
              mode={mode}
              catalogItem={catalogItem}
              currentVersion={currentVersion}
              isEdit={!!appSpec}
              existingApp={appSpec}
              requiresAdvancedConfig={requiresAdvancedConfig}
            />
          )}
        </WizardStep>
        {showConfigStep && (
          <WizardStep
            name={t('Configuration')}
            id={configStepId}
            isDisabled={isWizardStepDisabled(configStepId, orderedIds, validStepIds)}
          >
            {currentStep?.id === configStepId && <AppConfigStep isEdit={!!appSpec} />}
          </WizardStep>
        )}
        <WizardStep
          name={t('Review and deploy')}
          id={reviewStepId}
          isDisabled={isWizardStepDisabled(reviewStepId, orderedIds, validStepIds)}
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
  currentApps: ApplicationProviderSpec[] | undefined;
  version: string;
  channel: string;
  mode: CatalogEditWizardMode;
};

const EditAppWizard = ({
  mode,
  catalogItem,
  currentVersion,
  onUpdate,
  currentChannel,
  appSpec,
  currentApps,
  version,
  channel,
}: EditAppWizardProps) => {
  const { t } = useTranslation();

  const latestVersion = getSortedUpdates(catalogItem, currentChannel, currentVersion.version)[0]?.version;
  const appVersion = appSpec ? latestVersion || currentVersion.version : version;
  const appConfig = getInitialAppConfig(catalogItem, appVersion, appSpec);

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
        wantAdvancedConfig: mode === 'edit',
        ...appConfig,
      }}
      validateOnMount
      onSubmit={onSubmit}
    >
      <WizardContent
        mode={mode}
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
