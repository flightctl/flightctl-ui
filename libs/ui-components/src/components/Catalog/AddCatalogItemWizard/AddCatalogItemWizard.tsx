import * as React from 'react';
import {
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
import { ApiVersion, Catalog, CatalogItem, CatalogList } from '@flightctl/types/alpha';
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
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchItem();
  }, [get, isEdit, catalogId, itemId]);

  if (isLoading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  const initialValues = editItem ? getInitialValuesFromItem(editItem) : getInitialValues();

  const pageTitle = isEdit
    ? t('Edit {{ name }}', { name: editItem?.spec.displayName || editItem?.metadata.name })
    : t('Create catalog item');

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
                  await patch<CatalogItem>(`catalogs/${catalogId}/items/${itemId}`, patchRequest);
                } else {
                  const catalogList = await get<CatalogList>('catalogs');

                  let catalogName: string;
                  if (!catalogList.items.length) {
                    catalogName = 'catalog';
                    await post<Catalog>('catalogs', {
                      apiVersion: ApiVersion.V1ALPHA1,
                      kind: 'Catalog',
                      metadata: {
                        name: catalogName,
                      },
                      spec: {},
                    });
                  } else {
                    catalogName = catalogList.items[0].metadata.name || '';
                  }
                  const resource = getCatalogItemResource(values, catalogName);
                  await post<CatalogItem>(`catalogs/${catalogName}/items`, resource);
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
                      {(!currentStep || currentStep?.id === generalInfoStepId) && <GeneralInfoStep isEdit={isEdit} />}
                    </WizardStep>
                    <WizardStep
                      name={t('Type and configuration')}
                      id={typeConfigStepId}
                      isDisabled={isDisabledStep(generalInfoStepId, validStepIds)}
                    >
                      {currentStep?.id === typeConfigStepId && <TypeConfigStep isEdit={isEdit} />}
                    </WizardStep>
                    <WizardStep
                      name={t('Versions')}
                      id={versionStepId}
                      isDisabled={
                        isDisabledStep(typeConfigStepId, validStepIds) ||
                        isDisabledStep(generalInfoStepId, validStepIds)
                      }
                    >
                      {currentStep?.id === versionStepId && <VersionStep />}
                    </WizardStep>
                    <WizardStep
                      name={isEdit ? t('Review and save') : t('Review and create')}
                      id={reviewStepId}
                      isDisabled={
                        isDisabledStep(versionStepId, validStepIds) ||
                        isDisabledStep(typeConfigStepId, validStepIds) ||
                        isDisabledStep(generalInfoStepId, validStepIds)
                      }
                    >
                      {currentStep?.id === reviewStepId && <ReviewStep error={error} isEdit={isEdit} />}
                    </WizardStep>
                  </Wizard>
                </>
              );
            }}
          </Formik>
        </ErrorBoundary>
      </PageSection>
    </>
  );
};

export default AddCatalogItemWizard;
