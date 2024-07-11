import * as React from 'react';
import { Formik } from 'formik';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  PageSection,
  PageSectionVariants,
  Spinner,
  Title,
  Wizard,
  WizardStep,
  WizardStepType,
} from '@patternfly/react-core';

import { Device } from '@flightctl/types';
import { EditDeviceFormValues } from './types';
import { getErrorMessage } from '../../../utils/error';
import { fromAPILabel } from '../../../utils/labels';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link, ROUTE, useNavigate } from '../../../hooks/useNavigate';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';
import ErrorBoundary from '../../common/ErrorBoundary';
import GeneralInfoStep, { generalInfoStepId, isGeneralInfoStepValid } from './steps/GeneralInfoStep';
import DeviceTemplateStep, { deviceTemplateStepId, isDeviceTemplateStepValid } from './steps/DeviceTemplateStep';
import ReviewDeviceStep, { reviewDeviceStepId } from './steps/ReviewDeviceStep';
import { getDevicePatches, getValidationSchema } from './utils';
import { getConfigTemplatesValues } from './deviceSpecUtils';
import { useFetch } from '../../../hooks/useFetch';
import { useEditDevice } from './useEditDevice';
import EditDeviceWizardFooter from './EditDeviceWizardFooter';

const EditDeviceWizard = () => {
  const { t } = useTranslation();
  const [submitError, setSubmitError] = React.useState<string | undefined>();
  const navigate = useNavigate();
  const { patch } = useFetch();
  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();

  const [deviceId, device, isLoading, loadError] = useEditDevice();
  const displayName = device?.metadata.labels?.displayName || '';
  const displayNameText = device ? displayName || t('Untitled') : deviceId;

  let body: React.ReactNode;
  if (isLoading) {
    body = (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  } else if (loadError) {
    body = (
      <Alert isInline variant="danger" title={t('An error occurred')}>
        {getErrorMessage(loadError)}
      </Alert>
    );
  } else if (!!device?.metadata.owner) {
    body = (
      <Alert isInline variant="info" title={t('Device is non-editable')}>
        {t('This device is managed by a fleet and it cannot be edited directly.')}
      </Alert>
    );
  } else if (device) {
    body = (
      <Formik<EditDeviceFormValues>
        initialValues={{
          displayName,
          osImage: device.spec?.os?.image,
          labels: fromAPILabel(device.metadata.labels || {}).filter((label) => label.key !== 'displayName'),
          configTemplates: getConfigTemplatesValues(device.spec),
        }}
        validationSchema={getValidationSchema(t)}
        validateOnMount
        onSubmit={async (values) => {
          setSubmitError(undefined);
          try {
            const patches = getDevicePatches(device, values);
            if (patches.length > 0) {
              await patch<Device>(`devices/${deviceId}`, patches);
            }
            navigate({ route: ROUTE.DEVICE_DETAILS, postfix: deviceId });
          } catch (e) {
            setSubmitError(getErrorMessage(e));
          }
        }}
      >
        {({ errors: formikErrors }) => {
          const generalStepValid = isGeneralInfoStepValid(formikErrors);
          const templateStepValid = isDeviceTemplateStepValid(formikErrors);
          return (
            <>
              <LeaveFormConfirmation />
              <Wizard footer={<EditDeviceWizardFooter />} onStepChange={(_, step) => setCurrentStep(step)}>
                <WizardStep name={t('General info')} id={generalInfoStepId}>
                  {(!currentStep || currentStep?.id === generalInfoStepId) && <GeneralInfoStep />}
                </WizardStep>
                <WizardStep name={t('Device template')} id={deviceTemplateStepId} isDisabled={!generalStepValid}>
                  {currentStep?.id === deviceTemplateStepId && <DeviceTemplateStep />}
                </WizardStep>
                <WizardStep
                  name={t('Review and update')}
                  id={reviewDeviceStepId}
                  isDisabled={!(generalStepValid && templateStepValid)}
                >
                  {currentStep?.id === reviewDeviceStepId && <ReviewDeviceStep error={submitError} />}
                </WizardStep>
              </Wizard>
            </>
          );
        }}
      </Formik>
    );
  }

  return (
    <>
      <PageSection variant="light" type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={ROUTE.DEVICES}>{t('Devices')}</Link>
          </BreadcrumbItem>
          {deviceId && (
            <BreadcrumbItem>
              <Link to={{ route: ROUTE.DEVICE_DETAILS, postfix: deviceId }}>{displayNameText}</Link>
            </BreadcrumbItem>
          )}
          <BreadcrumbItem isActive>{t('Edit device')}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h1" size="3xl">
          {t('Edit device')}
        </Title>
      </PageSection>
      <PageSection variant={PageSectionVariants.light} type="wizard">
        <ErrorBoundary>{body}</ErrorBoundary>
      </PageSection>
    </>
  );
};

export default EditDeviceWizard;
