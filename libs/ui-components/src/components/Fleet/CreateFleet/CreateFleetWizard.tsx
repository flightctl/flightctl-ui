import * as React from 'react';
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
import { Fleet } from '@flightctl/types';
import { Formik, FormikErrors } from 'formik';

import { FleetFormValues } from './../../../types/deviceSpec';
import { RESOURCE, VERB } from '../../../types/rbac';
import { useFetch } from '../../../hooks/useFetch';
import { getErrorMessage } from '../../../utils/error';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link, ROUTE, useNavigate } from '../../../hooks/useNavigate';
import GeneralInfoStep, { generalInfoStepId, isGeneralInfoStepValid } from './steps/GeneralInfoStep';
import DeviceTemplateStep, {
  deviceTemplateStepId,
  isDeviceTemplateStepValid,
} from '../../Device/EditDeviceWizard/steps/DeviceTemplateStep';
import ReviewStep, { reviewStepId } from './steps/ReviewStep';
import UpdatePolicyStep, { isUpdatePolicyStepValid, updatePolicyStepId } from './steps/UpdatePolicyStep';
import { getFleetPatches, getFleetResource, getInitialValues, getValidationSchema } from './utils';
import CreateFleetWizardFooter from './CreateFleetWizardFooter';
import { useEditFleet } from './useEditFleet';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';
import ErrorBoundary from '../../common/ErrorBoundary';
import { useAccessReview } from '../../../hooks/useAccessReview';
import PageWithPermissions from '../../common/PageWithPermissions';
import { useAppContext } from '../../../hooks/useAppContext';

import './CreateFleetWizard.css';

const orderedIds = [generalInfoStepId, deviceTemplateStepId, updatePolicyStepId, reviewStepId];

const getValidStepIds = (formikErrors: FormikErrors<FleetFormValues>): string[] => {
  const validStepIds: string[] = [];
  if (isGeneralInfoStepValid(formikErrors)) {
    validStepIds.push(generalInfoStepId);
  }
  if (isDeviceTemplateStepValid(formikErrors)) {
    validStepIds.push(deviceTemplateStepId);
  }
  if (isUpdatePolicyStepValid(formikErrors)) {
    validStepIds.push(updatePolicyStepId);
  }
  // Review step is always valid. We disable it if some of the previous steps are invalid
  if (validStepIds.length === orderedIds.length - 1) {
    validStepIds.push(reviewStepId);
  }
  return validStepIds;
};

const isDisabledStep = (stepId: string | undefined, validStepIds: string[]) => {
  if (!stepId) {
    return true;
  }

  const stepIdx = orderedIds.findIndex((stepOrderId) => stepOrderId === stepId);

  return orderedIds.some((orderedId, orderedStepIdx) => {
    return orderedStepIdx < stepIdx && !validStepIds.includes(orderedId);
  });
};

const CreateFleetWizard = () => {
  const { t } = useTranslation();
  const { post, patch } = useFetch();
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
        onSubmit={async (values) => {
          setError(undefined);
          try {
            if (isEdit) {
              const fleetPatches = getFleetPatches(fleet as Fleet, values);
              if (fleetPatches.length > 0) {
                await patch<Fleet>(`fleets/${fleetId}`, fleetPatches);
              }
            } else {
              await post<Fleet>('fleets', getFleetResource(values));
            }

            navigate({ route: ROUTE.FLEET_DETAILS, postfix: values.name });
          } catch (e) {
            setError(e);
          }
        }}
      >
        {({ errors: formikErrors }) => {
          const validStepIds = getValidStepIds(formikErrors);

          return (
            <>
              <LeaveFormConfirmation />
              <Wizard
                footer={<CreateFleetWizardFooter isEdit={isEdit} />}
                onStepChange={(_, step) => {
                  if (error) {
                    setError(undefined);
                  }
                  setCurrentStep(step);
                }}
                className="fctl-create-fleet"
              >
                <WizardStep name={t('General info')} id={generalInfoStepId}>
                  {(!currentStep || currentStep?.id === generalInfoStepId) && <GeneralInfoStep isEdit={isEdit} />}
                </WizardStep>
                <WizardStep
                  name={t('Device template')}
                  id={deviceTemplateStepId}
                  isDisabled={isDisabledStep(deviceTemplateStepId, validStepIds)}
                >
                  {currentStep?.id === deviceTemplateStepId && <DeviceTemplateStep isFleet />}
                </WizardStep>
                <WizardStep
                  name={t('Updates')}
                  id={updatePolicyStepId}
                  isDisabled={isDisabledStep(updatePolicyStepId, validStepIds)}
                >
                  {currentStep?.id === updatePolicyStepId && <UpdatePolicyStep />}
                </WizardStep>
                <WizardStep
                  name={isEdit ? t('Review and save') : t('Review and create')}
                  id={reviewStepId}
                  isDisabled={isDisabledStep(reviewStepId, validStepIds)}
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

  const title = isEdit ? t('Edit fleet') : t('Create fleet');

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

const CreateFleetWizardWithPermissions = () => {
  const {
    router: { useParams },
  } = useAppContext();
  const { fleetId } = useParams<{ fleetId: string }>();
  const [createAllowed, createLoading] = useAccessReview(RESOURCE.FLEET, VERB.CREATE);
  const [patchAllowed, patchLoading] = useAccessReview(RESOURCE.FLEET, VERB.PATCH);
  return (
    <PageWithPermissions
      allowed={fleetId ? patchAllowed : createAllowed}
      loading={fleetId ? patchLoading : createLoading}
    >
      <CreateFleetWizard />
    </PageWithPermissions>
  );
};

export default CreateFleetWizardWithPermissions;
