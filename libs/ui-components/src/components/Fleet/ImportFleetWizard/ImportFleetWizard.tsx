import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Bullseye,
  Button,
  PageSection,
  PageSectionVariants,
  Spinner,
  Title,
  Wizard,
  WizardFooterWrapper,
  WizardStep,
  WizardStepType,
  useWizardContext,
} from '@patternfly/react-core';
import * as React from 'react';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { Formik, useFormikContext } from 'formik';

import RepositoryStep, { isRepoStepValid, repositoryStepId } from './steps/RepositoryStep';
import ReviewStep, { reviewStepId } from './steps/ReviewStep';
import ResourceSyncStep, { isResourceSyncStepValid, resourceSyncStepId } from './steps/ResourceSyncStep';
import { ImportFleetFormValues } from './types';
import { useFetch } from '../../../hooks/useFetch';
import { RepoSpecType, Repository, RepositoryList, ResourceSync } from '@flightctl/types';
import {
  getInitValues,
  getRepository,
  getResourceSync,
  handlePromises,
  repoSyncSchema,
  repositorySchema,
} from '../../Repository/CreateRepository/utils';
import { getErrorMessage } from '../../../utils/error';

import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link, ROUTE, useNavigate } from '../../../hooks/useNavigate';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';
import ErrorBoundary from '../../common/ErrorBoundary';

import './ImportFleetWizard.css';

const validationSchema = (t: TFunction) =>
  Yup.lazy((values: ImportFleetFormValues) =>
    values.useExistingRepo
      ? Yup.object({
          existingRepo: Yup.string().required(t('Repository is required')),
          resourceSyncs: repoSyncSchema(t, values.resourceSyncs),
        })
      : repositorySchema(t, undefined)({ ...values, useResourceSyncs: true, exists: false }),
  );

const ImportFleetWizardFooter = () => {
  const { t } = useTranslation();
  const { goToNextStep, goToPrevStep, activeStep } = useWizardContext();
  const { submitForm, isSubmitting, errors, values } = useFormikContext<ImportFleetFormValues>();
  const navigate = useNavigate();

  const isReviewStep = activeStep.id === reviewStepId;
  let isStepValid = true;
  if (activeStep.id === repositoryStepId) {
    isStepValid = isRepoStepValid(values, errors);
  } else if (activeStep.id === resourceSyncStepId) {
    isStepValid = isResourceSyncStepValid(errors);
  }
  const primaryBtn = isReviewStep ? (
    <Button variant="primary" onClick={submitForm} isDisabled={isSubmitting} isLoading={isSubmitting}>
      {t('Import')}
    </Button>
  ) : (
    <Button variant="primary" onClick={goToNextStep} isDisabled={!isStepValid}>
      {t('Next')}
    </Button>
  );

  return (
    <WizardFooterWrapper>
      {primaryBtn}
      {activeStep.id !== repositoryStepId && (
        <Button variant="secondary" onClick={goToPrevStep} isDisabled={isSubmitting}>
          {t('Back')}
        </Button>
      )}
      <Button variant="link" onClick={() => navigate(-1)} isDisabled={isSubmitting}>
        {t('Cancel')}
      </Button>
    </WizardFooterWrapper>
  );
};

const ImportFleetWizard = () => {
  const { t } = useTranslation();
  const { post } = useFetch();
  const [errors, setErrors] = React.useState<string[]>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();
  const [repoList, isLoading, error] = useFetchPeriodically<RepositoryList>({
    endpoint: 'repositories',
  });

  const gitRepositories = (repoList?.items || []).filter((repo) => repo.spec.type === RepoSpecType.GIT);

  let body: React.ReactNode;

  if (isLoading) {
    body = (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  } else if (error) {
    body = (
      <Alert isInline variant="danger" title={t('An error occurred')}>
        {getErrorMessage(error)}
      </Alert>
    );
  } else {
    const repoInitValues = getInitValues({
      options: {
        allowedRepoTypes: [RepoSpecType.GIT],
        showRepoTypes: false,
      },
    });
    body = (
      <Formik<ImportFleetFormValues>
        initialValues={{
          useExistingRepo: true,
          existingRepo: '',
          ...repoInitValues,
        }}
        validationSchema={validationSchema(t)}
        validateOnMount
        onSubmit={async (values) => {
          setErrors(undefined);
          if (!values.useExistingRepo) {
            try {
              await post<Repository>('repositories', getRepository(values));
            } catch (e) {
              setErrors([getErrorMessage(e)]);
              return;
            }
          }
          const resourceSyncPromises = values.resourceSyncs.map((rs) =>
            post<ResourceSync>(
              'resourcesyncs',
              getResourceSync(values.useExistingRepo ? values.existingRepo : values.name, rs),
            ),
          );
          const errors = await handlePromises(resourceSyncPromises);
          if (errors.length) {
            setErrors(errors);
            return;
          }
          navigate(ROUTE.FLEETS);
        }}
      >
        {({ values, errors: formikErrors }) => (
          <>
            <LeaveFormConfirmation />
            <Wizard
              footer={<ImportFleetWizardFooter />}
              onStepChange={(_, step) => setCurrentStep(step)}
              className="fctl-import-fleet"
            >
              <WizardStep name={t('Select or create repository')} id={repositoryStepId}>
                {(!currentStep || currentStep?.id === repositoryStepId) && (
                  <RepositoryStep repositories={gitRepositories} hasLoaded={!!repoList} />
                )}
              </WizardStep>
              <WizardStep
                name={t('Add resource sync')}
                id={resourceSyncStepId}
                isDisabled={
                  (!currentStep || currentStep?.id === repositoryStepId) && !isRepoStepValid(values, formikErrors)
                }
              >
                {currentStep?.id === resourceSyncStepId && <ResourceSyncStep />}
              </WizardStep>
              <WizardStep
                name={t('Review')}
                id={reviewStepId}
                isDisabled={!isRepoStepValid(values, formikErrors) || !isResourceSyncStepValid(formikErrors)}
              >
                {currentStep?.id === reviewStepId && <ReviewStep errors={errors} />}
              </WizardStep>
            </Wizard>
          </>
        )}
      </Formik>
    );
  }

  return (
    <>
      <PageSection variant="light" type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={ROUTE.FLEETS}>{t('Fleets')}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{t('Import fleets')}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h1" size="3xl">
          {t('Import fleets')}
        </Title>
      </PageSection>
      <PageSection variant={PageSectionVariants.light} type="wizard">
        <ErrorBoundary>{body}</ErrorBoundary>
      </PageSection>
    </>
  );
};

export default ImportFleetWizard;
