import * as React from 'react';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  PageSection,
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
import { usePermissionsContext } from '../../common/PermissionsContext';
import PageWithPermissions from '../../common/PageWithPermissions';
import { useAppContext } from '../../../hooks/useAppContext';

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

  const { checkPermissions } = usePermissionsContext();
  const [canEdit] = checkPermissions([{ kind: RESOURCE.FLEET, verb: VERB.PATCH }]);

  const isEdit = !!fleetId;
  const isReadOnly = !!fleet?.metadata.owner || (isEdit && !canEdit);

  let body: React.ReactNode;

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
          let reviewStepLabel: string;
          if (isReadOnly) {
            reviewStepLabel = t('Review');
          } else if (isEdit) {
            reviewStepLabel = t('Review and save');
          } else {
            reviewStepLabel = t('Review and create');
          }

          return (
            <>
              <LeaveFormConfirmation />
              <Wizard
                footer={<CreateFleetWizardFooter isReadOnly={isReadOnly} isEdit={isEdit} />}
                onStepChange={(_, step) => {
                  if (error) {
                    setError(undefined);
                  }
                  setCurrentStep(step);
                }}
              >
                <WizardStep name={t('General info')} id={generalInfoStepId}>
                  {(!currentStep || currentStep?.id === generalInfoStepId) && (
                    <GeneralInfoStep isEdit={isEdit} isReadOnly={isReadOnly} />
                  )}
                </WizardStep>
                <WizardStep
                  name={t('Device template')}
                  id={deviceTemplateStepId}
                  isDisabled={isDisabledStep(deviceTemplateStepId, validStepIds)}
                >
                  {currentStep?.id === deviceTemplateStepId && <DeviceTemplateStep isFleet isReadOnly={isReadOnly} />}
                </WizardStep>
                <WizardStep
                  name={t('Updates')}
                  id={updatePolicyStepId}
                  isDisabled={isDisabledStep(updatePolicyStepId, validStepIds)}
                >
                  {currentStep?.id === updatePolicyStepId && <UpdatePolicyStep isReadOnly={isReadOnly} />}
                </WizardStep>
                <WizardStep
                  name={reviewStepLabel}
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

  let title: string;
  if (isReadOnly) {
    title = t('View fleet');
  } else if (isEdit) {
    title = t('Edit fleet');
  } else {
    title = t('Create fleet');
  }

  return (
    <>
      <PageSection hasBodyWrapper={false} type="breadcrumb">
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
      <PageSection hasBodyWrapper={false}>
        <Title headingLevel="h1" size="3xl">
          {title}
        </Title>
      </PageSection>
      <PageSection hasBodyWrapper={false} type="wizard">
        <ErrorBoundary>{body}</ErrorBoundary>
      </PageSection>
    </>
  );
};

const createFleetWizardPermissions = [
  { kind: RESOURCE.FLEET, verb: VERB.CREATE },
  { kind: RESOURCE.FLEET, verb: VERB.PATCH },
];

const CreateFleetWizardWithPermissions = () => {
  const {
    router: { useParams },
  } = useAppContext();
  const { fleetId } = useParams<{ fleetId: string }>();
  const { checkPermissions, loading } = usePermissionsContext();
  const [createAllowed, patchAllowed] = checkPermissions(createFleetWizardPermissions);
  return (
    <PageWithPermissions allowed={fleetId ? patchAllowed : createAllowed} loading={loading}>
      <CreateFleetWizard />
    </PageWithPermissions>
  );
};

export default CreateFleetWizardWithPermissions;
