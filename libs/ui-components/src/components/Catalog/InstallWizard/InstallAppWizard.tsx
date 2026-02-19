import { CatalogItem } from '@flightctl/types/alpha';
import { Wizard, WizardStep, WizardStepType } from '@patternfly/react-core';
import { Formik, useFormikContext } from 'formik';
import * as React from 'react';
import * as Yup from 'yup';
import { load } from 'js-yaml';
import { RJSFValidationError } from '@rjsf/utils';
import { Device, Fleet } from '@flightctl/types';

import { useTranslation } from '../../../hooks/useTranslation';
import { useFetch } from '../../../hooks/useFetch';
import { getAppPatches } from '../utils';
import { InstallAppFormik, appConfigStepId, reviewStepId, selectTargetStepId, specificationsStepId } from './types';
import SpecificationsStep, { isSpecsStepValid } from './steps/SpecificationsStep';
import SelectTargetStep, { isSelectTargetStepValid } from './steps/SelectTargetStep';
import AppConfigStep, { isAppConfigStepValid } from './steps/AppConfigStep';
import ReviewStep from './steps/ReviewStep';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';
import UpdateSuccessPage from './UpdateSuccessPage';
import FlightCtlWizardFooter, { FlightCtlWizardFooterProps } from '../../common/FlightCtlWizardFooter';
import { useAppContext } from '../../../hooks/useAppContext';
import { getInitialAppConfig } from './utils';
import { useSubmit } from '../useSubmit';

export const validateAppWizardStep: FlightCtlWizardFooterProps<InstallAppFormik>['validateStep'] = (
  activeStepId,
  errors,
  values,
) => {
  if (activeStepId === specificationsStepId) return isSpecsStepValid(errors);
  if (activeStepId === selectTargetStepId) return isSelectTargetStepValid(errors);
  if (activeStepId === appConfigStepId) return isAppConfigStepValid(values, errors);
  return true;
};

type InstallAppWizardContentProps = {
  currentStep: WizardStepType | undefined;
  setCurrentStep: (step: WizardStepType) => void;
  error: string | undefined;
  schemaErrors: RJSFValidationError[] | undefined;
  catalogItem: CatalogItem;
  isSuccessful: boolean;
};

const InstallAppWizardContent = ({
  currentStep,
  setCurrentStep,
  error,
  schemaErrors,
  catalogItem,
  isSuccessful,
}: InstallAppWizardContentProps) => {
  const { t } = useTranslation();
  const { values, errors } = useFormikContext<InstallAppFormik>();
  return isSuccessful ? (
    <UpdateSuccessPage />
  ) : (
    <>
      <LeaveFormConfirmation />
      <Wizard
        footer={
          <FlightCtlWizardFooter<InstallAppFormik>
            firstStepId={specificationsStepId}
            submitStepId={reviewStepId}
            validateStep={validateAppWizardStep}
            saveButtonText={t('Deploy')}
          />
        }
        onStepChange={(_, step) => setCurrentStep(step)}
      >
        <WizardStep name={t('Specifications')} id={specificationsStepId}>
          {(!currentStep || currentStep?.id === specificationsStepId) && (
            <SpecificationsStep catalogItem={catalogItem} />
          )}
        </WizardStep>
        <WizardStep name={t('Select target')} id={selectTargetStepId} isDisabled={!isSpecsStepValid(errors)}>
          {currentStep?.id === selectTargetStepId && <SelectTargetStep />}
        </WizardStep>
        <WizardStep
          name={t('Application configuration')}
          id={appConfigStepId}
          isDisabled={!isSelectTargetStepValid(errors) || !isSpecsStepValid(errors)}
        >
          {currentStep?.id === appConfigStepId && <AppConfigStep schemaErrors={schemaErrors} />}
        </WizardStep>
        <WizardStep
          name={t('Review')}
          id={reviewStepId}
          isDisabled={
            !isAppConfigStepValid(values, errors) || !isSpecsStepValid(errors) || !isSelectTargetStepValid(errors)
          }
        >
          {currentStep?.id === reviewStepId && <ReviewStep isApp error={error} />}
        </WizardStep>
      </Wizard>
    </>
  );
};

type InstallAppWizardProps = {
  catalogItem: CatalogItem;
};

const InstallAppWizard = ({ catalogItem }: InstallAppWizardProps) => {
  const { t } = useTranslation();
  const [isSuccessful, setIsSuccessful] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();
  const { patch, get } = useFetch();

  const {
    router: { useSearchParams },
  } = useAppContext();
  const [searchParams] = useSearchParams();
  const channel = searchParams.get('channel') || '';
  const version = searchParams.get('version') || '';

  const validationSchema = Yup.lazy((values: InstallAppFormik) =>
    Yup.object({
      target: Yup.string().required(t('Target must be selected')),
      channel: Yup.string().required(t('Channel must be selected')),
      version: Yup.string().required(t('Version must be selected')),
      device: values.target === 'device' ? Yup.object().required(t('Device must be selected')) : Yup.object(),
      fleet: values.target === 'fleet' ? Yup.object().required(t('Fleet must be selected')) : Yup.object(),
      appName: Yup.string()
        .required(t('Application name is required'))
        .test('is-unique', t('Application with the same name already exists.'), (value) => {
          if (!value || value.length === 0 || !values.target) {
            return true;
          }
          const apps =
            values.target === 'device'
              ? values.device?.spec?.applications
              : values.fleet?.spec.template.spec.applications;
          if (!apps?.length) {
            return true;
          }
          return !apps.some((app) => app.name === value);
        }),
    }),
  );

  const initialValues = React.useMemo<InstallAppFormik>(() => {
    const appConfig = getInitialAppConfig(catalogItem, version);
    return {
      version,
      channel,
      target: undefined,
      fleet: undefined,
      device: undefined,
      ...appConfig,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { onSubmit, error, schemaErrors } = useSubmit<InstallAppFormik>({
    onUpdate: async (values) => {
      if (values.target !== 'fleet' && values.target !== 'device') {
        return;
      }
      const selectedDevice = values.device;
      const selectedFleet = values.fleet;
      const installToDevice = values.target === 'device';
      const resourceId = installToDevice
        ? `devices/${selectedDevice?.metadata.name}`
        : `fleets/${selectedFleet?.metadata.name}`;

      const res = await get<Device | Fleet>(resourceId);
      const currentLabels = res?.metadata.labels;
      const specPath = installToDevice ? '/' : '/spec/template/';
      const catalogItemVersion = catalogItem.spec.versions.find((v) => v.version === values.version);

      if (!catalogItemVersion || !values.channel) {
        return;
      }
      const currentApps = installToDevice
        ? (res as Device)?.spec?.applications
        : (res as Fleet)?.spec.template.spec.applications;
      const allPatches = getAppPatches({
        appName: values.appName,
        currentApps,
        currentLabels,
        catalogItem,
        catalogItemVersion,
        channel: values.channel,
        formValues:
          values.configureVia === 'editor'
            ? (load(values.editorContent) as Record<string, unknown>)
            : values.formValues,
        specPath,
        selectedAssets: values.configureVia === 'form' ? values.selectedAssets : [],
      });
      if (!allPatches.length) {
        return;
      }
      await patch(resourceId, allPatches);
    },
  });

  return (
    <Formik<InstallAppFormik>
      validationSchema={validationSchema}
      initialValues={initialValues}
      validateOnMount
      onSubmit={async (values) => {
        const success = await onSubmit(values);
        if (success) {
          setIsSuccessful(true);
        }
      }}
    >
      <InstallAppWizardContent
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        error={error}
        schemaErrors={schemaErrors}
        catalogItem={catalogItem}
        isSuccessful={isSuccessful}
      />
    </Formik>
  );
};

export default InstallAppWizard;
