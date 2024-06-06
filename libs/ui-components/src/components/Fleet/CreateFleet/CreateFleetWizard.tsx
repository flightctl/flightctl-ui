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
import * as React from 'react';
import { Fleet } from '@flightctl/types';
import { Formik } from 'formik';
import ReviewStep, { reviewStepId } from './steps/ReviewStep';
import { FleetFormValues } from './types';
import { useFetch } from '../../../hooks/useFetch';
import { getErrorMessage } from '../../../utils/error';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link, ROUTE, useNavigate } from '../../../hooks/useNavigate';
import GeneralInfoStep, { generalInfoStepId, isGeneralInfoStepValid } from './steps/GeneralInfoStep';

import DeviceTemplateStep, { deviceTemplateStepId, isDeviceTemplateStepValid } from './steps/DeviceTemplateStep';
import { getFleetResource, getInitialValues, getValidationSchema } from './utils';
import CreateFleetWizardFooter from './CreateFleetWizardFooter';
import { useEditFleet } from './useEditFleet';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';
import ErrorBoundary from '../../common/ErrorBoundary';

import './CreateFleetWizard.css';

const CreateFleetWizard = () => {
  const { t } = useTranslation();
  const { post, put } = useFetch();
  const [error, setError] = React.useState<unknown>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();
  const [fleetId, fleet, loading, editError] = useEditFleet();
  const isEdit = !!fleetId;
  let body;

  if (loading) {
    body = (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  } else if (editError) {
    body = (
      <Alert isInline variant="danger" title={t('An error occurred')}>
        {getErrorMessage(editError)}
      </Alert>
    );
  } else if (!!fleet?.metadata.owner) {
    body = (
      <Alert isInline variant="info" title={t('Fleet is non-editable')}>
        {t('This fleet is managed by a resource sync and it cannot be edited directly.')}
      </Alert>
    );
  } else {
    body = (
      <Formik<FleetFormValues>
        initialValues={getInitialValues(fleet)}
        validationSchema={getValidationSchema(t)}
        validateOnMount
        validateOnChange={false}
        onSubmit={async (values) => {
          setError(undefined);
          try {
            const result = await (isEdit
              ? put<Fleet>(`fleets/${fleetId}`, getFleetResource(values))
              : post<Fleet>('fleets', getFleetResource(values)));
            navigate({ route: ROUTE.FLEET_DETAILS, postfix: result.metadata.name });
          } catch (e) {
            setError(e);
          }
        }}
      >
        {({ errors: formikErrors }) => {
          const generalStepValid = isGeneralInfoStepValid(formikErrors);
          return (
            <>
              <LeaveFormConfirmation />
              <Wizard
                footer={<CreateFleetWizardFooter isEdit={isEdit} />}
                onStepChange={(_, step) => setCurrentStep(step)}
                className="fctl-create-fleet"
              >
                <WizardStep name={t('General info')} id={generalInfoStepId}>
                  {(!currentStep || currentStep?.id === generalInfoStepId) && <GeneralInfoStep isEdit={isEdit} />}
                </WizardStep>
                <WizardStep
                  name={t('Device template')}
                  id={deviceTemplateStepId}
                  isDisabled={(!currentStep || currentStep?.id === generalInfoStepId) && !generalStepValid}
                >
                  {currentStep?.id === deviceTemplateStepId && <DeviceTemplateStep />}
                </WizardStep>
                <WizardStep
                  name={isEdit ? t('Review and update') : t('Review and create')}
                  id={reviewStepId}
                  isDisabled={!generalStepValid || !isDeviceTemplateStepValid(formikErrors)}
                >
                  {currentStep?.id === reviewStepId && <ReviewStep error={error} />}
                </WizardStep>
              </Wizard>
            </>
          );
        }}
      </Formik>
    );
  }

  const title = isEdit ? t('Update fleet') : t('Create fleet');

  return (
    <>
      <PageSection variant="light" type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={ROUTE.FLEETS}>{t('Fleets')}</Link>
          </BreadcrumbItem>
          {fleetId && (
            <BreadcrumbItem>
              <Link to={{ route: ROUTE.FLEET_DETAILS, postfix: fleetId }}>{fleetId}</Link>
            </BreadcrumbItem>
          )}
          <BreadcrumbItem isActive>{title}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h1" size="3xl">
          {title}
        </Title>
      </PageSection>
      <PageSection variant={PageSectionVariants.light} type="wizard">
        <ErrorBoundary>{body}</ErrorBoundary>
      </PageSection>
    </>
  );
};

export default CreateFleetWizard;
