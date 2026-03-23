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
import * as React from 'react';
import * as Yup from 'yup';
import { TFunction } from 'i18next';
import { Formik, FormikErrors } from 'formik';
import { RepoSpecType, Repository, RepositoryList, ResourceSync } from '@flightctl/types';

import RepositoryStep, { isRepoStepValid, repositoryStepId } from './steps/RepositoryStep';
import ReviewStep, { reviewStepId } from './steps/ReviewStep';
import ResourceSyncStep, { isResourceSyncStepValid, resourceSyncStepId } from './steps/ResourceSyncStep';
import { ImportResourceFormValues, ImportResourceWizardProps } from './types';
import { useFetch } from '../../hooks/useFetch';
import {
  getInitValues,
  getRepository,
  getResourceSync,
  handlePromises,
  repoSyncSchema,
  repositorySchema,
} from '../Repository/CreateRepository/utils';
import { getErrorMessage } from '../../utils/error';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useNavigate } from '../../hooks/useNavigate';
import LeaveFormConfirmation from '../common/LeaveFormConfirmation';
import ErrorBoundary from '../common/ErrorBoundary';
import PageWithPermissions from '../common/PageWithPermissions';
import { usePermissionsContext } from '../common/PermissionsContext';
import FlightCtlWizardFooter from '../common/FlightCtlWizardFooter';
import { RESOURCE, VERB } from '../../types/rbac';

const validationSchema = (t: TFunction) =>
  Yup.lazy((values: ImportResourceFormValues) =>
    values.useExistingRepo
      ? Yup.object({
          existingRepo: Yup.string().required(t('Repository is required')),
          resourceSyncs: repoSyncSchema(t, values.resourceSyncs),
        })
      : repositorySchema(t, undefined)({ ...values, useResourceSyncs: true, exists: false }),
  );

const validateFooterStep = (
  activeStepId: string,
  errors: FormikErrors<ImportResourceFormValues>,
  values: ImportResourceFormValues,
) => {
  if (activeStepId === repositoryStepId) {
    return isRepoStepValid(values, errors);
  } else if (activeStepId === resourceSyncStepId) {
    return isResourceSyncStepValid(errors);
  }
  return true;
};

const ImportResourceWizardContent = ({
  resourceSyncType,
  successRoute,
  resourceSyncDescription,
  reviewInfoText,
}: ImportResourceWizardProps) => {
  const { t } = useTranslation();
  const { post } = useFetch();
  const [errors, setErrors] = React.useState<string[]>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();
  const [repoList, isLoading, error] = useFetchPeriodically<RepositoryList>({
    endpoint: 'repositories',
  });

  const gitRepositories = (repoList?.items || []).filter((repo) => repo.spec.type === RepoSpecType.RepoSpecTypeGit);

  if (isLoading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  if (error) {
    return (
      <Alert isInline variant="danger" title={t('An error occurred')}>
        {getErrorMessage(error)}
      </Alert>
    );
  }

  const repoInitValues = getInitValues({
    options: {
      allowedRepoTypes: [RepoSpecType.RepoSpecTypeGit],
      showRepoTypes: false,
      defaultRSType: resourceSyncType,
    },
  });

  return (
    <Formik<ImportResourceFormValues>
      initialValues={{
        useExistingRepo: true,
        existingRepo: gitRepositories.length === 1 ? gitRepositories[0].metadata.name || '' : '',
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
        const rsErrors = await handlePromises(resourceSyncPromises);
        if (rsErrors.length) {
          setErrors(rsErrors);
          return;
        }
        navigate(successRoute);
      }}
    >
      {({ values, errors: formikErrors }) => (
        <>
          <LeaveFormConfirmation />
          <Wizard
            footer={
              <FlightCtlWizardFooter<ImportResourceFormValues>
                firstStepId={repositoryStepId}
                submitStepId={reviewStepId}
                validateStep={validateFooterStep}
                saveButtonText={t('Import')}
              />
            }
            onStepChange={(_, step) => setCurrentStep(step)}
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
              {currentStep?.id === resourceSyncStepId && (
                <ResourceSyncStep description={resourceSyncDescription} defaultSyncType={resourceSyncType} />
              )}
            </WizardStep>
            <WizardStep
              name={t('Review')}
              id={reviewStepId}
              isDisabled={!isRepoStepValid(values, formikErrors) || !isResourceSyncStepValid(formikErrors)}
            >
              {currentStep?.id === reviewStepId && <ReviewStep errors={errors} infoText={reviewInfoText} />}
            </WizardStep>
          </Wizard>
        </>
      )}
    </Formik>
  );
};

const ImportResourceWizard = (props: ImportResourceWizardProps) => {
  const { breadcrumb, title } = props;
  return (
    <>
      <PageSection hasBodyWrapper={false} type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={breadcrumb.route}>{breadcrumb.label}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{title}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection hasBodyWrapper={false}>
        <Title headingLevel="h1" size="3xl">
          {title}
        </Title>
      </PageSection>
      <PageSection hasBodyWrapper={false} type="wizard">
        <ErrorBoundary>
          <ImportResourceWizardContent {...props} />
        </ErrorBoundary>
      </PageSection>
    </>
  );
};

const importResourceWizardPermissions = [
  { kind: RESOURCE.RESOURCE_SYNC, verb: VERB.CREATE },
  { kind: RESOURCE.REPOSITORY, verb: VERB.LIST },
];

const ImportResourceWizardWithPermissions = (props: ImportResourceWizardProps) => {
  const { checkPermissions, loading: isLoading } = usePermissionsContext();
  const [canCreateRs, canReadRepo] = checkPermissions(importResourceWizardPermissions);
  const allowed = canCreateRs && canReadRepo;
  return (
    <PageWithPermissions allowed={allowed} loading={isLoading}>
      <ImportResourceWizard {...props} />
    </PageWithPermissions>
  );
};

export default ImportResourceWizardWithPermissions;
