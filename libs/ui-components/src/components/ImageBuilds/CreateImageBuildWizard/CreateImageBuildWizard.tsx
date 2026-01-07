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
import { Formik, FormikErrors } from 'formik';

import { ExportFormatType, ImageBuild } from '@flightctl/types/imagebuilder';
import { RESOURCE, VERB } from '../../../types/rbac';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link, ROUTE, useNavigate } from '../../../hooks/useNavigate';

import ReviewStep, { reviewStepId } from './steps/ReviewStep';
import { getErrorMessage } from '../../../utils/error';
import { getImageBuildResource, getImageExportResources, getInitialValues, getValidationSchema } from './utils';
import { isPromiseRejected } from '../../../types/typeUtils';
import { ImageBuildFormValues, ImageBuildWizardError } from './types';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';
import ErrorBoundary from '../../common/ErrorBoundary';
import PageWithPermissions from '../../common/PageWithPermissions';
import { usePermissionsContext } from '../../common/PermissionsContext';
import SourceImageStep, { isSourceImageStepValid, sourceImageStepId } from './steps/SourceImageStep';
import ImageOutputStep, { isOutputImageStepValid, outputImageStepId } from './steps/OutputImageStep';
import RegistrationStep, { isRegistrationStepValid, registrationStepId } from './steps/RegistrationStep';
import CreateImageBuildWizardFooter from './CreateImageBuildWizardFooter';
import { useFetch } from '../../../hooks/useFetch';
import { useEditImageBuild } from './useEditImageBuild';
import { OciRegistriesContextProvider, useOciRegistriesContext } from '../OciRegistriesContext';
import { hasImageBuildFailed } from '../../../utils/imageBuilds';

const orderedIds = [sourceImageStepId, outputImageStepId, registrationStepId, reviewStepId];

const getValidStepIds = (formikErrors: FormikErrors<ImageBuildFormValues>): string[] => {
  const validStepIds: string[] = [];
  if (isSourceImageStepValid(formikErrors)) {
    validStepIds.push(sourceImageStepId);
  }
  if (isOutputImageStepValid(formikErrors)) {
    validStepIds.push(outputImageStepId);
  }
  if (isRegistrationStepValid(formikErrors)) {
    validStepIds.push(registrationStepId);
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

const CreateImageBuildWizard = () => {
  const { t } = useTranslation();
  const { post } = useFetch();
  const navigate = useNavigate();
  const [error, setError] = React.useState<ImageBuildWizardError>();
  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();
  const [imageBuildId, imageBuild, imageBuildLoading, editError] = useEditImageBuild();
  const { isLoading: registriesLoading, error: registriesError } = useOciRegistriesContext();

  const isEdit = !!imageBuildId;
  const hasFailed = imageBuild ? hasImageBuildFailed(imageBuild) : false;

  let title: string;
  if (isEdit) {
    title = hasFailed ? t('Retry image build') : t('Duplicate image build');
  } else {
    title = t('Build new image');
  }

  return (
    <>
      <PageSection hasBodyWrapper={false} type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={ROUTE.IMAGE_BUILDS}>{t('Image builds')}</Link>
          </BreadcrumbItem>
          {imageBuildId && (
            <BreadcrumbItem>
              <Link to={{ route: ROUTE.IMAGE_BUILD_DETAILS, postfix: imageBuildId }}>{imageBuildId}</Link>
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
        <ErrorBoundary>
          {registriesLoading || imageBuildLoading ? (
            <Bullseye>
              <Spinner />
            </Bullseye>
          ) : registriesError || editError ? (
            <Alert isInline variant="danger" title={t('An error occurred')}>
              {getErrorMessage(registriesError || editError)}
            </Alert>
          ) : (
            <Formik<ImageBuildFormValues>
              initialValues={getInitialValues(imageBuild)}
              validationSchema={getValidationSchema(t)}
              validateOnMount
              onSubmit={async (values) => {
                setError(undefined);
                let buildName: string;

                try {
                  const imageBuild = getImageBuildResource(values);
                  buildName = imageBuild.metadata.name as string;
                  const createdBuild = await post<ImageBuild>('imagebuilds', imageBuild);
                  if (createdBuild.metadata.name !== buildName) {
                    throw new Error(t('ImageBuild was created but has a different name'));
                  }
                } catch (err) {
                  // Build creation failed
                  setError({ type: 'build', error: getErrorMessage(err) });
                  return;
                }

                if (values.exportFormats.length > 0) {
                  const imageExports = getImageExportResources(values, buildName);
                  const exportResults = await Promise.allSettled(
                    imageExports.map((imageExport) => post('imageexports', imageExport)),
                  );

                  const exportErrors: Array<{ format: ExportFormatType; error: unknown }> = [];
                  exportResults.forEach((result, index) => {
                    if (isPromiseRejected(result)) {
                      exportErrors.push({
                        format: values.exportFormats[index],
                        error: result.reason,
                      });
                    }
                  });

                  if (exportErrors.length > 0) {
                    setError({
                      type: 'export',
                      buildName,
                      errors: exportErrors,
                    });
                    return;
                  }
                }

                navigate(ROUTE.IMAGE_BUILDS);
              }}
            >
              {({ errors: formikErrors }) => {
                const validStepIds = getValidStepIds(formikErrors);

                return (
                  <>
                    <LeaveFormConfirmation />
                    <Wizard
                      footer={<CreateImageBuildWizardFooter />}
                      onStepChange={(_, step) => {
                        if (error) {
                          setError(undefined);
                        }
                        setCurrentStep(step);
                      }}
                    >
                      <WizardStep name={t('Image details')} id={sourceImageStepId}>
                        {(!currentStep || currentStep?.id === sourceImageStepId) && <SourceImageStep />}
                      </WizardStep>
                      <WizardStep
                        name={t('Image output')}
                        id={outputImageStepId}
                        isDisabled={isDisabledStep(outputImageStepId, validStepIds)}
                      >
                        {currentStep?.id === outputImageStepId && <ImageOutputStep />}
                      </WizardStep>
                      <WizardStep
                        name={t('Registration')}
                        id={registrationStepId}
                        isDisabled={isDisabledStep(registrationStepId, validStepIds)}
                      >
                        {currentStep?.id === registrationStepId && <RegistrationStep />}
                      </WizardStep>
                      <WizardStep
                        name={t('Review')}
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
          )}
        </ErrorBoundary>
      </PageSection>
    </>
  );
};

const createImageBuildWizardPermissions = [{ kind: RESOURCE.IMAGE_BUILD, verb: VERB.CREATE }];

const CreateImageBuildWizardWithPermissions = () => {
  const { checkPermissions, loading } = usePermissionsContext();
  const [createAllowed] = checkPermissions(createImageBuildWizardPermissions);
  return (
    <PageWithPermissions allowed={createAllowed} loading={loading}>
      <OciRegistriesContextProvider>
        <CreateImageBuildWizard />
      </OciRegistriesContextProvider>
    </PageWithPermissions>
  );
};

export default CreateImageBuildWizardWithPermissions;
