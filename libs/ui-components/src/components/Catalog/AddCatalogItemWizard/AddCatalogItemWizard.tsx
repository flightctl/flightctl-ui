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
import { CatalogItem } from '@flightctl/types/alpha';
import { Formik, FormikErrors } from 'formik';

import { useAppContext } from '../../../hooks/useAppContext';
import { useFetch } from '../../../hooks/useFetch';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link, ROUTE, useNavigate } from '../../../hooks/useNavigate';
import GeneralInfoStep, { generalInfoStepId, isGeneralInfoStepValid } from './steps/GeneralInfoStep';
import TypeConfigStep, { isTypeConfigStepValid, typeConfigStepId } from './steps/TypeConfigStep';
import VersionStep, { isVersionStepValid, versionStepId } from './steps/VersionStep';
import ReviewStep, { reviewStepId } from './steps/ReviewStep';
import {
  getCatalogItemPatches,
  getCatalogItemResource,
  getInitialValues,
  getInitialValuesFromItem,
  getValidationSchema,
} from './utils';
import { AddCatalogItemFormValues } from './types';
import FlightCtlWizardFooter from '../../common/FlightCtlWizardFooter';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';
import ErrorBoundary from '../../common/ErrorBoundary';
import { getErrorMessage } from '../../../utils/error';

const orderedIds = [generalInfoStepId, typeConfigStepId, versionStepId, reviewStepId];

const getValidStepIds = (formikErrors: FormikErrors<AddCatalogItemFormValues>): string[] => {
  const validStepIds: string[] = [];
  if (isGeneralInfoStepValid(formikErrors)) {
    validStepIds.push(generalInfoStepId);
  }
  if (isTypeConfigStepValid(formikErrors)) {
    validStepIds.push(typeConfigStepId);
  }
  if (isVersionStepValid(formikErrors)) {
    validStepIds.push(versionStepId);
  }
  if (validStepIds.length === orderedIds.length - 1) {
    validStepIds.push(reviewStepId);
  }
  return validStepIds;
};

const isDisabledStep = (stepId: string, validStepIds: string[]) => {
  const validIndex = validStepIds.indexOf(stepId);
  return validIndex === -1 || validIndex !== orderedIds.indexOf(stepId);
};

const validateStep = (activeStepId: string, errors: FormikErrors<AddCatalogItemFormValues>) => {
  switch (activeStepId) {
    case generalInfoStepId:
      return isGeneralInfoStepValid(errors);
    case typeConfigStepId:
      return isTypeConfigStepValid(errors);
    case versionStepId:
      return isVersionStepValid(errors);
    case reviewStepId:
      return true;
    default:
      return false;
  }
};

const AddCatalogItemWizard = () => {
  const { t } = useTranslation();
  const {
    router: { useParams },
  } = useAppContext();
  const { catalogId, itemId } = useParams<{ catalogId: string; itemId: string }>();
  const isEdit = !!catalogId && !!itemId;

  const { post, patch, get } = useFetch();
  const [initErr, setInitErr] = React.useState<unknown>();
  const [error, setError] = React.useState<unknown>();
  const [isLoading, setIsLoading] = React.useState(isEdit);
  const [editItem, setEditItem] = React.useState<CatalogItem>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();

  React.useEffect(() => {
    if (!isEdit) {
      return;
    }
    const fetchItem = async () => {
      try {
        const item = await get<CatalogItem>(`catalogs/${catalogId}/items/${itemId}`);
        setEditItem(item);
      } catch (e) {
        setInitErr(e);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchItem();
  }, [get, isEdit, catalogId, itemId]);

  const initialValues = editItem ? getInitialValuesFromItem(editItem) : getInitialValues();
  const isReadOnly = !!editItem?.metadata?.owner;

  let pageTitle: string;
  if (isReadOnly) {
    pageTitle = t('View {{ name }}', { name: editItem?.spec.displayName || editItem?.metadata.name });
  } else if (isEdit) {
    pageTitle = t('Edit {{ name }}', { name: editItem?.spec.displayName || editItem?.metadata.name });
  } else {
    pageTitle = t('Create catalog item');
  }

  let content: React.ReactNode = (
    <PageSection hasBodyWrapper={false} type="wizard">
      <ErrorBoundary>
        <Formik<AddCatalogItemFormValues>
          initialValues={initialValues}
          validationSchema={getValidationSchema(t)}
          validateOnMount
          onSubmit={async (values) => {
            setError(undefined);
            try {
              if (isEdit) {
                const patchRequest = getCatalogItemPatches(values, editItem!);
                if (patchRequest.length) {
                  await patch<CatalogItem>(`catalogs/${catalogId}/items/${itemId}`, patchRequest);
                }
              } else {
                const resource = getCatalogItemResource(values, values.catalog);
                await post<CatalogItem>(`catalogs/${values.catalog}/items`, resource);
              }
              navigate(ROUTE.CATALOG);
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
                  footer={
                    <FlightCtlWizardFooter
                      firstStepId={generalInfoStepId}
                      submitStepId={reviewStepId}
                      validateStep={(activeStepId, errors) => validateStep(activeStepId, errors)}
                      isReadOnly={isReadOnly}
                      saveButtonText={isEdit ? t('Save') : t('Create')}
                    />
                  }
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
                    name={t('Type and configuration')}
                    id={typeConfigStepId}
                    isDisabled={isDisabledStep(generalInfoStepId, validStepIds)}
                  >
                    {currentStep?.id === typeConfigStepId && <TypeConfigStep isEdit={isEdit} isReadOnly={isReadOnly} />}
                  </WizardStep>
                  <WizardStep
                    name={t('Versions')}
                    id={versionStepId}
                    isDisabled={
                      isDisabledStep(typeConfigStepId, validStepIds) || isDisabledStep(generalInfoStepId, validStepIds)
                    }
                  >
                    {currentStep?.id === versionStepId && <VersionStep isReadOnly={isReadOnly} isEdit={isEdit} />}
                  </WizardStep>
                  <WizardStep
                    name={isReadOnly ? t('Review') : isEdit ? t('Review and save') : t('Review and create')}
                    id={reviewStepId}
                    isDisabled={
                      isDisabledStep(versionStepId, validStepIds) ||
                      isDisabledStep(typeConfigStepId, validStepIds) ||
                      isDisabledStep(generalInfoStepId, validStepIds)
                    }
                  >
                    {currentStep?.id === reviewStepId && (
                      <ReviewStep error={error} isEdit={isEdit} isReadOnly={isReadOnly} />
                    )}
                  </WizardStep>
                </Wizard>
              </>
            );
          }}
        </Formik>
      </ErrorBoundary>
    </PageSection>
  );

  if (isLoading) {
    content = (
      <PageSection>
        <Bullseye>
          <Spinner />
        </Bullseye>
      </PageSection>
    );
  }

  if (initErr) {
    content = (
      <PageSection>
        <Alert isInline variant="danger" title={t('Failed to fetch catalog item {{item}}', { item: itemId })}>
          {getErrorMessage(initErr)}
        </Alert>
      </PageSection>
    );
  }

  return (
    <>
      <PageSection hasBodyWrapper={false} type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={ROUTE.CATALOG}>{t('Software Catalog')}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{pageTitle}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection hasBodyWrapper={false}>
        <Title headingLevel="h1" size="3xl">
          {pageTitle}
        </Title>
      </PageSection>
      {content}
    </>
  );
};

export default AddCatalogItemWizard;
