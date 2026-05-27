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

import {
  ExportFormatType,
  ImageBuild,
  ImageExport,
  ImagePromotion,
  ImagePromotionList,
} from '@flightctl/types/imagebuilder';
import { CatalogItem } from '@flightctl/types/alpha';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link, ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useFetch } from '../../../hooks/useFetch';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { useAppContext } from '../../../hooks/useAppContext';
import { getErrorMessage } from '../../../utils/error';

import { RESOURCE, VERB } from '../../../types/rbac';
import ErrorBoundary from '../../common/ErrorBoundary';
import LeaveFormConfirmation from '../../common/LeaveFormConfirmation';
import { usePermissionsContext } from '../../common/PermissionsContext';
import { OciRegistriesContextProvider, useOciRegistriesContext } from '../OciRegistriesContext';
import { useCatalogItem } from '../../Catalog/useCatalogs';
import NewVersionStep, { isNewVersionStepValid, newVersionStepId } from './steps/NewVersionStep';
import CatalogStep, { catalogStepId, isCatalogStepValid } from '../CreateImageBuildWizard/steps/CatalogStep';
import ReviewStep, { reviewStepId } from './steps/ReviewStep';
import NewVersionImageBuildWizardFooter from './NewVersionImageBuildWizardFooter';
import { NewVersionWizardFormValues } from './types';
import {
  bumpImageTag,
  getCatalogInitialValues,
  getImagePromotion,
  getLatestPromotion,
  getValidationSchema,
} from './utils';
import { ImageBuildWithExports } from '../../../types/extraTypes';
import { useImageBuild } from '../useImageBuilds';
import { getImageExportResources } from '../CreateImageBuildWizard/utils';
import { isPromiseRejected } from '../../../types/typeUtils';
import { ImageBuildWizardError } from '../CreateImageBuildWizard/types';
import { isWizardStepDisabled } from '../../../utils/wizards';

const orderedIds = [newVersionStepId, catalogStepId, reviewStepId];

const getValidStepIds = (formikErrors: FormikErrors<NewVersionWizardFormValues>): string[] => {
  const validStepIds: string[] = [];
  if (isNewVersionStepValid(formikErrors)) {
    validStepIds.push(newVersionStepId);
  }
  if (isCatalogStepValid(formikErrors)) {
    validStepIds.push(catalogStepId);
  }
  if (validStepIds.length === orderedIds.length - 1) {
    validStepIds.push(reviewStepId);
  }
  return validStepIds;
};

type NewVersionImageBuildWizardInnerProps = {
  imageBuild: ImageBuildWithExports;
  parentPromotion: ImagePromotion | undefined;
  catalogItem: CatalogItem | undefined;
  canPromote: boolean;
};

const NewVersionImageBuildWizardInner = ({
  imageBuild,
  parentPromotion,
  catalogItem,
  canPromote,
}: NewVersionImageBuildWizardInnerProps) => {
  const { t } = useTranslation();
  const { post } = useFetch();
  const navigate = useNavigate();
  const [error, setError] = React.useState<ImageBuildWizardError>();
  const [currentStep, setCurrentStep] = React.useState<WizardStepType>();

  const parentName = imageBuild.metadata.name as string;
  const parentSourceTag = imageBuild.spec.source.imageTag;
  const parentDestinationTag = imageBuild.spec.destination.imageTag;

  const catalogInitialValues = getCatalogInitialValues(catalogItem);

  const initialValues: NewVersionWizardFormValues = {
    ...catalogInitialValues,
    buildName: '',
    sourceImageTag: parentSourceTag,
    destinationImageTag: bumpImageTag(parentDestinationTag),
    promoteToCatalog: canPromote && !!parentPromotion,
    exportFormats: imageBuild.imageExports.filter(Boolean).map((ie) => (ie as ImageExport).spec.format),
  };

  const handleSubmit = async (values: NewVersionWizardFormValues) => {
    setError(undefined);
    let createdBuildName: string;

    try {
      const created = await post<Record<string, string>, ImageBuild>(`imagebuilds/${parentName}/newversion`, {
        name: values.buildName.trim(),
        ...(values.sourceImageTag.trim() && values.sourceImageTag.trim() !== parentSourceTag
          ? { sourceImageTag: values.sourceImageTag.trim() }
          : {}),
        ...(values.destinationImageTag.trim() ? { destinationImageTag: values.destinationImageTag.trim() } : {}),
      });
      createdBuildName = created.metadata.name as string;
    } catch (err) {
      setError({ type: 'build', error: err });
      return;
    }

    if (values.exportFormats.length > 0) {
      const imageExports = getImageExportResources(values, createdBuildName);
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
          buildName: createdBuildName,
          errors: exportErrors,
        });
        return;
      }
    }

    if (values.promoteToCatalog) {
      const imagePromotion = getImagePromotion(values, createdBuildName);

      try {
        await post('imagepromotions', imagePromotion);
      } catch (err) {
        setError({ type: 'promotion', error: err });
        return;
      }
    }

    navigate(ROUTE.IMAGE_BUILDS);
  };

  return (
    <Formik<NewVersionWizardFormValues>
      initialValues={initialValues}
      validationSchema={getValidationSchema(t)}
      validateOnMount
      onSubmit={handleSubmit}
    >
      {({ errors: formikErrors }) => {
        const validStepIds = getValidStepIds(formikErrors);

        return (
          <>
            <LeaveFormConfirmation />
            <Wizard
              footer={<NewVersionImageBuildWizardFooter />}
              onStepChange={(_, step) => {
                if (error) {
                  setError(undefined);
                }
                setCurrentStep(step);
              }}
            >
              <WizardStep name={t('Rebuild details')} id={newVersionStepId}>
                {(!currentStep || currentStep?.id === newVersionStepId) && <NewVersionStep imageBuild={imageBuild} />}
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
                {currentStep?.id === reviewStepId && <ReviewStep imageBuild={imageBuild} error={error} />}
              </WizardStep>
            </Wizard>
          </>
        );
      }}
    </Formik>
  );
};

const promotionPermissions = [
  { kind: RESOURCE.IMAGE_PROMOTION, verb: VERB.LIST },
  { kind: RESOURCE.IMAGE_PROMOTION, verb: VERB.CREATE },
];

const NewVersionImageBuildWizard = () => {
  const { t } = useTranslation();
  const {
    router: { useParams },
  } = useAppContext();
  const { imageBuildId } = useParams() as { imageBuildId: string };
  const { isLoading: registriesLoading, error: registriesError } = useOciRegistriesContext();
  const { checkPermissions, loading: permissionsLoading } = usePermissionsContext();
  const [canListPromotions, canPromote] = checkPermissions(promotionPermissions);

  const [imageBuild, imageBuildLoading, imageBuildError] = useImageBuild(imageBuildId);

  const [promotionList, promotionsLoading, promotionsError] = useFetchPeriodically<ImagePromotionList>({
    endpoint:
      imageBuildId && canListPromotions
        ? `imagepromotions?fieldSelector=${encodeURIComponent(`spec.source.imageBuildRef=${imageBuildId}`)}`
        : '',
  });

  const activePromotion = getLatestPromotion(promotionList?.items || []);
  const promotionTarget = activePromotion?.spec.target;

  const [catalogItem, , catalogItemError] = useCatalogItem(
    promotionTarget?.catalogName,
    promotionTarget?.catalogItemName,
  );

  // useFetchPeriodically never resets isLoading back to true when the endpoint changes,
  // so we can't rely on the loading flag. Instead, wait until we have the item or an error.
  const isLoading =
    permissionsLoading ||
    imageBuildLoading ||
    registriesLoading ||
    (canListPromotions && promotionsLoading) ||
    (!!activePromotion && !catalogItem && !catalogItemError);
  const loadError = imageBuildError || registriesError || promotionsError;

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
          <BreadcrumbItem isActive>{t('Rebuild')}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection hasBodyWrapper={false}>
        <Title headingLevel="h1" size="3xl">
          {t('Rebuild')}
        </Title>
      </PageSection>
      <PageSection hasBodyWrapper={false} type="wizard">
        <ErrorBoundary>
          {isLoading ? (
            <Bullseye>
              <Spinner />
            </Bullseye>
          ) : loadError ? (
            <Alert isInline variant="danger" title={t('An error occurred')}>
              {getErrorMessage(loadError)}
            </Alert>
          ) : imageBuild ? (
            <NewVersionImageBuildWizardInner
              imageBuild={imageBuild}
              parentPromotion={activePromotion}
              catalogItem={catalogItem}
              canPromote={canPromote}
            />
          ) : null}
        </ErrorBoundary>
      </PageSection>
    </>
  );
};

const NewVersionImageBuildWizardWithRegistries = () => {
  return (
    <OciRegistriesContextProvider>
      <NewVersionImageBuildWizard />
    </OciRegistriesContextProvider>
  );
};

export default NewVersionImageBuildWizardWithRegistries;
