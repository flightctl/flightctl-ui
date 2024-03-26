import {
  Alert,
  Bullseye,
  Button,
  Spinner,
  Wizard,
  WizardFooterWrapper,
  WizardHeader,
  WizardStep,
  WizardStepType,
  useWizardContext,
} from '@patternfly/react-core';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import RepositoryStep, { isRepoStepValid, repositoryStepId } from './steps/RepositoryStep';
import ReviewStep, { reviewStepId } from './steps/ReviewStep';
import ResourceSyncStep, { isResourceSyncStepValid, resourceSyncStepId } from './steps/ResourceSyncStep';
import { Formik, useFormikContext } from 'formik';
import { ImportFleetFormValues } from './types';
import { useFetch } from '@app/hooks/useFetch';
import { Repository, RepositoryList, ResourceSync, ResourceSyncList } from '@types';
import {
  getRepository,
  getResourceSync,
  handlePromises,
  repoSyncSchema,
  repositorySchema,
} from '@app/components/Repository/CreateRepository/CreateRepository';
import { getErrorMessage } from '@app/utils/error';
import * as Yup from 'yup';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';

import './ImportFleetWizard.css';

const validationSchema = (resourceSyncs: ResourceSync[], repositories: Repository[]) =>
  Yup.lazy((values: ImportFleetFormValues) =>
    values.useExistingRepo
      ? Yup.object({
          existingRepo: Yup.string().required('Repository is required'),
          resourceSyncs: repoSyncSchema(values.resourceSyncs, resourceSyncs),
        })
      : repositorySchema(resourceSyncs, repositories)({ ...values, useResourceSyncs: true }),
  );

const ImportFleetWizardFooter = () => {
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
      Import
    </Button>
  ) : (
    <Button variant="primary" onClick={goToNextStep} isDisabled={!isStepValid}>
      Next
    </Button>
  );

  return (
    <WizardFooterWrapper>
      <Button
        variant="secondary"
        onClick={goToPrevStep}
        isDisabled={isSubmitting || activeStep.id === repositoryStepId}
      >
        Back
      </Button>
      {primaryBtn}
      <Button variant="link" onClick={() => navigate(-1)} isDisabled={isSubmitting}>
        Cancel
      </Button>
    </WizardFooterWrapper>
  );
};

const ImportFleetWizard = () => {
  const { post } = useFetch();
  const [errors, setErrors] = React.useState<string[]>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();
  const [repoList, isLoading, error] = useFetchPeriodically<RepositoryList>({ endpoint: 'repositories' });
  const [rsList, isRsLoading, rsError] = useFetchPeriodically<ResourceSyncList>({ endpoint: 'resourcesyncs' });

  if (isLoading || isRsLoading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  if (error || rsError) {
    return (
      <Alert isInline variant="danger" title="An error occured">
        {error ? getErrorMessage(error) : getErrorMessage(rsError)}
      </Alert>
    );
  }

  return (
    <Formik<ImportFleetFormValues>
      initialValues={{
        useExistingRepo: false,
        existingRepo: '',
        name: '',
        credentials: {
          isPrivate: false,
        },
        resourceSyncs: [
          {
            name: '',
            path: '',
            targetRevision: '',
          },
        ],
        url: '',
      }}
      validationSchema={validationSchema(rsList?.items || [], repoList?.items || [])}
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
        navigate('/devicemanagement/fleets');
      }}
    >
      {({ values, errors: formikErrors }) => (
        <Wizard
          header={<WizardHeader title="Import fleets" isCloseHidden />}
          footer={<ImportFleetWizardFooter />}
          onStepChange={(_, step) => setCurrentStep(step)}
          className="fctl-import-fleet"
        >
          <WizardStep name="Select or create repository" id={repositoryStepId}>
            {(!currentStep || currentStep?.id === repositoryStepId) && (
              <RepositoryStep repositories={repoList?.items || []} />
            )}
          </WizardStep>
          <WizardStep
            name="Add resource sync"
            id={resourceSyncStepId}
            isDisabled={
              (!currentStep || currentStep?.id === repositoryStepId) && !isRepoStepValid(values, formikErrors)
            }
          >
            {currentStep?.id === resourceSyncStepId && <ResourceSyncStep />}
          </WizardStep>
          <WizardStep
            name="Review"
            id={reviewStepId}
            isDisabled={!isRepoStepValid(values, formikErrors) || !isResourceSyncStepValid(formikErrors)}
          >
            {currentStep?.id === reviewStepId && <ReviewStep errors={errors} />}
          </WizardStep>
        </Wizard>
      )}
    </Formik>
  );
};

export default ImportFleetWizard;
