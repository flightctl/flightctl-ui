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
import OutputImageStep, { isOutputImageStepValid, outputImageStepId } from './steps/OutputImageStep';
import RegistrationStep, { isRegistrationStepValid, registrationStepId } from './steps/RegistrationStep';
import CreateImageBuildWizardFooter from './CreateImageBuildWizardFooter';
import { useFetch } from '../../../hooks/useFetch';
import { OciRegistriesContextProvider, useOciRegistriesContext } from '../OciRegistriesContext';
import { isWizardStepDisabled } from '../../../utils/wizards';
import CatalogStep, { catalogStepId, isCatalogStepValid } from './steps/CatalogStep';
import { getImagePromotion } from '../NewVersionImageBuildWizard/utils';

const orderedIds = [sourceImageStepId, outputImageStepId, registrationStepId, catalogStepId, reviewStepId];

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
  if (isCatalogStepValid(formikErrors)) {
    validStepIds.push(catalogStepId);
  }
  // Review step is always valid. We disable it if some of the previous steps are invalid
  if (validStepIds.length === orderedIds.length - 1) {
    validStepIds.push(reviewStepId);
  }
  return validStepIds;
};

const promotionPermissions = [{ kind: RESOURCE.IMAGE_PROMOTION, verb: VERB.CREATE }];

const CreateImageBuildWizard = () => {
  const { t } = useTranslation();
  const { post } = useFetch();
  const navigate = useNavigate();
  const [error, setError] = React.useState<ImageBuildWizardError>();
  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();
  const { isLoading: registriesLoading, error: registriesError } = useOciRegistriesContext();
  const { checkPermissions, loading: permissionsLoading } = usePermissionsContext();
  const [canPromote] = checkPermissions(promotionPermissions);

  return (
    <>
      <PageSection hasBodyWrapper={false} type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={ROUTE.IMAGE_BUILDS}>{t('Image builds')}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{t('Build new image')}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection hasBodyWrapper={false}>
        <Title headingLevel="h1" size="3xl">
          {t('Build new image')}
        </Title>
      </PageSection>
      <PageSection hasBodyWrapper={false} type="wizard">
        <ErrorBoundary>
          {registriesLoading || permissionsLoading ? (
            <Bullseye>
              <Spinner />
            </Bullseye>
          ) : registriesError ? (
            <Alert isInline variant="danger" title={t('An error occurred')}>
              {getErrorMessage(registriesError)}
            </Alert>
          ) : (
            <Formik<ImageBuildFormValues>
              initialValues={{ ...getInitialValues(), promoteToCatalog: canPromote }}
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
                    throw new Error(t('Image build was created but has a different name'));
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

                  const exportErrors = exportResults.reduce(
                    (acc, result, index) => {
                      if (isPromiseRejected(result)) {
                        acc.push({
                          format: values.exportFormats[index],
                          error: result.reason,
                        });
                      }
                      return acc;
                    },
                    [] as Array<{ format: ExportFormatType; error: unknown }>,
                  );

                  if (exportErrors.length > 0) {
                    setError({
                      type: 'export',
                      buildName,
                      errors: exportErrors,
                    });
                    return;
                  }
                }

                if (values.promoteToCatalog) {
                  const imagePromotion = getImagePromotion(values, buildName);

                  try {
                    await post('imagepromotions', imagePromotion);
                  } catch (err) {
                    setError({ type: 'promotion', error: err });
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
                      <WizardStep name={t('Base image')} id={sourceImageStepId}>
                        {(!currentStep || currentStep?.id === sourceImageStepId) && <SourceImageStep />}
                      </WizardStep>
                      <WizardStep
                        name={t('Image output')}
                        id={outputImageStepId}
                        isDisabled={isWizardStepDisabled(outputImageStepId, orderedIds, validStepIds)}
                      >
                        {currentStep?.id === outputImageStepId && <OutputImageStep />}
                      </WizardStep>
                      <WizardStep
                        name={t('Registration')}
                        id={registrationStepId}
                        isDisabled={isWizardStepDisabled(registrationStepId, orderedIds, validStepIds)}
                      >
                        {currentStep?.id === registrationStepId && <RegistrationStep />}
                      </WizardStep>
                      <WizardStep
                        name={t('Software Catalog')}
                        id={catalogStepId}
                        isDisabled={isWizardStepDisabled(catalogStepId, orderedIds, validStepIds)}
                      >
                        {currentStep?.id === catalogStepId && <CatalogStep canPromote={canPromote} />}
                      </WizardStep>
                      <WizardStep
                        name={t('Review')}
                        id={reviewStepId}
                        isDisabled={isWizardStepDisabled(reviewStepId, orderedIds, validStepIds)}
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
