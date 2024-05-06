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
import { Fleet, FleetList } from '@flightctl/types';
import { Formik } from 'formik';
import ReviewStep, { reviewStepId } from './steps/ReviewStep';
import { FleetFormValues } from './types';
import { useFetch } from '../../../hooks/useFetch';
import { getErrorMessage } from '../../../utils/error';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import GeneralInfoStep, { generalInfoStepId, isGeneralInfoStepValid } from './steps/GeneralInfoStep';

import DeviceTemplateStep, { deviceTemplateStepId, isDeviceTemplateStepValid } from './steps/DeviceTemplateStep';
import { useAppContext } from '../../../hooks/useAppContext';
import { getFleetResource, getInitialValues, getValidationSchema } from './utils';
import CreateFleetWizardFooter from './CreateFleetWizardFooter';
import { useEditFleet } from './useEditFleet';

import './CreateFleetWizard.css';

const CreateFleetWizard = () => {
  const { t } = useTranslation();
  const { post, put } = useFetch();
  const {
    router: { Link },
  } = useAppContext();
  const [error, setError] = React.useState<unknown>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();
  const [fleetList, fleetsLoading, fleetsError] = useFetchPeriodically<FleetList>({ endpoint: 'fleets' });

  const [fleetId, fleet, editLoading, editError] = useEditFleet();
  const isEdit = !!fleetId;
  let body;

  if (fleetsLoading || editLoading) {
    body = (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  } else if (fleetsError || editError) {
    body = (
      <Alert isInline variant="danger" title={t('An error occurred')}>
        {getErrorMessage(fleetsError || editError)}
      </Alert>
    );
  } else {
    body = (
      <Formik<FleetFormValues>
        initialValues={getInitialValues(fleet)}
        validationSchema={getValidationSchema(t, isEdit ? undefined : fleetList?.items)}
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
            <Link to={'/devicemanagement/fleets'}>{t('Fleets')}</Link>
          </BreadcrumbItem>
          {fleetId && (
            <BreadcrumbItem>
              <Link to={`/devicemanagement/fleets/${fleetId}`}>{fleetId}</Link>
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
        {body}
      </PageSection>
    </>
  );
};

export default CreateFleetWizard;
