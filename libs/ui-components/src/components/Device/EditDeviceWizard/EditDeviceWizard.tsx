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
import { getEditDisabledReason } from '../../../utils/devices';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link, ROUTE, useNavigate } from '../../../hooks/useNavigate';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';
import ErrorBoundary from '../../common/ErrorBoundary';
import GeneralInfoStep, { generalInfoStepId, isGeneralInfoStepValid } from './steps/GeneralInfoStep';
import DeviceTemplateStep, { deviceTemplateStepId, isDeviceTemplateStepValid } from './steps/DeviceTemplateStep';
import ReviewDeviceStep, { reviewDeviceStepId } from './steps/ReviewDeviceStep';
import { getDevicePatches, getValidationSchema } from './utils';
import { getApplicationValues, getConfigTemplatesValues, hasMicroshiftRegistrationConfig } from './deviceSpecUtils';
import { useFetch } from '../../../hooks/useFetch';
import { useEditDevice } from './useEditDevice';
import EditDeviceWizardNav from './EditDeviceWizardNav';
import EditDeviceWizardFooter from './EditDeviceWizardFooter';
import PageWithPermissions from '../../common/PageWithPermissions';
import { RESOURCE, VERB } from '../../../types/rbac';
import { useAccessReview } from '../../../hooks/useAccessReview';

import './EditDeviceWizard.css';

const EditDeviceWizard = () => {
  const { t } = useTranslation();
  const [submitError, setSubmitError] = React.useState<string | undefined>();
  const navigate = useNavigate();

  const { patch } = useFetch();

  const [deviceId, device, isLoading, loadError] = useEditDevice();
  const deviceAlias = device?.metadata.labels?.alias || '';
  const displayText = device ? deviceAlias || t('Untitled') : deviceId;

  const editDisabledReason = device ? getEditDisabledReason(device, t) : undefined;

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
  } else if (editDisabledReason) {
    body = (
      <Alert isInline variant="info" title={t('Device is non-editable')}>
        {editDisabledReason}
      </Alert>
    );
  } else if (device) {
    const registerMicroShift = hasMicroshiftRegistrationConfig(device.spec);
    body = (
      <Formik<EditDeviceFormValues>
        initialValues={{
          deviceAlias,
          osImage: device.spec?.os?.image || '',
          labels: fromAPILabel(device.metadata.labels || {}).filter((label) => label.key !== 'alias'),
          configTemplates: getConfigTemplatesValues(device.spec, registerMicroShift),
          fleetMatch: '', // Initially this is always a fleetless device
          applications: getApplicationValues(device.spec),
          systemdUnits: [],
          registerMicroShift,
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
                onStepChange={() => {
                  if (submitError) {
                    setSubmitError(undefined);
                  }
                }}
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

const EditDeviceWizardWithPermissions = () => {
  const [allowed, loading] = useAccessReview(RESOURCE.DEVICE, VERB.PATCH);
  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <EditDeviceWizard />
    </PageWithPermissions>
  );
};

export default EditDeviceWizardWithPermissions;
