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
import { getApplicationValues, getConfigTemplatesValues } from './deviceSpecUtils';
import { useFetch } from '../../../hooks/useFetch';
import { useEditDevice } from './useEditDevice';
import EditDeviceWizardNav from './EditDeviceWizardNav';
import EditDeviceWizardFooter from './EditDeviceWizardFooter';

import './EditDeviceWizard.css';

const EditDeviceWizard = () => {
  const { t } = useTranslation();
  const [submitError, setSubmitError] = React.useState<string | undefined>();
  const navigate = useNavigate();

  const { patch } = useFetch();

  const [deviceId, device, isLoading, loadError] = useEditDevice();
  const deviceAlias = device?.metadata.labels?.alias || '';
  const displayText = device ? deviceAlias || t('Untitled') : deviceId;

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
          deviceAlias,
          osImage: device.spec?.os?.image,
          labels: fromAPILabel(device.metadata.labels || {}).filter((label) => label.key !== 'alias'),
          configTemplates: getConfigTemplatesValues(device.spec),
          fleetMatch: '', // Initially this is always a fleetless device
          applications: getApplicationValues(device.spec),
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
        {({ values, errors: formikErrors }) => {
          const generalStepValid = isGeneralInfoStepValid(formikErrors);
          const templateStepValid = isDeviceTemplateStepValid(formikErrors);

          const canEditTemplate = !values.fleetMatch;
          const isTemplateStepDisabled = !(generalStepValid && canEditTemplate);
          return (
            <>
              <LeaveFormConfirmation />
              <Wizard
                className="fctl-edit-device__wizard"
                footer={<EditDeviceWizardFooter />}
                nav={<EditDeviceWizardNav />}
              >
                <WizardStep name={t('General info')} id={generalInfoStepId}>
                  <GeneralInfoStep />
                </WizardStep>
                <WizardStep name={t('Device template')} id={deviceTemplateStepId} isDisabled={isTemplateStepDisabled}>
                  <DeviceTemplateStep isFleet={false} />
                </WizardStep>
                <WizardStep name={t('Review and update')} id={reviewDeviceStepId} isDisabled={!templateStepValid}>
                  <ReviewDeviceStep error={submitError} />
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
              <Link to={{ route: ROUTE.DEVICE_DETAILS, postfix: deviceId }}>{displayText}</Link>
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
