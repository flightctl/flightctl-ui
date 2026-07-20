import { Alert, Button, ModalBody, ModalFooter, ModalHeader, Spinner } from '@patternfly/react-core';
import FlightCtlModal from '@flightctl/ui-components/src/components/common/FlightCtlModal';
import { Formik } from 'formik';
import * as React from 'react';

import ImagePromotionForm from './ImagePromotionForm';
import { ImagePromotionFormValues } from './types';
import { defaultInitialValues, getEditInitialValues, getInitialValues } from './utils';
import { useTranslation } from '../../hooks/useTranslation';
import { useFetch } from '../../hooks/useFetch';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { useCatalogItem } from '../Catalog/useCatalogs';
import { ExportFormatType, ImageExport, ImagePromotion, ImagePromotionList } from '@flightctl/types/imagebuilder';
import { PatchRequest } from '@flightctl/types';
import { getErrorMessage } from '../../utils/error';
import { canPromotionBeEdited, getImagePromotionValidationSchema } from './utils';
import { RESOURCE, VERB } from '../../types/rbac';
import { usePermissionsContext } from '../common/PermissionsContext';
import { ImageBuildWithExports } from '../../types/extraTypes';
import { getImagePromotion } from '../ImageBuilds/NewVersionImageBuildWizard/utils';

const NEW_VERSION_FROM_ANNOTATION = 'flightctl.io/new-version-from';

const getLatestPromotion = (promotions: ImagePromotion[]): ImagePromotion | undefined => {
  if (promotions.length === 0) return undefined;
  return promotions.slice().sort((a, b) => {
    const aTime = a.metadata.creationTimestamp ? new Date(a.metadata.creationTimestamp).getTime() : 0;
    const bTime = b.metadata.creationTimestamp ? new Date(b.metadata.creationTimestamp).getTime() : 0;
    return bTime - aTime;
  })[0];
};

const LoadingModal = ({ onClose }: { onClose: VoidFunction }) => {
  const { t } = useTranslation();
  return (
    <FlightCtlModal isOpen onClose={onClose} variant="small">
      <ModalHeader title={t('Add build to catalog')} />
      <ModalBody>
        <Spinner />
      </ModalBody>
    </FlightCtlModal>
  );
};

type ImagePromotionFormContainerProps = {
  onClose: (updated?: boolean) => void;
  imageBuild: ImageBuildWithExports;
  parentPromotion: ImagePromotion | undefined;
  imagePromotion?: ImagePromotion;
  canBeEdited: boolean;
};

const ImagePromotionFormContainer = ({
  onClose,
  imageBuild,
  parentPromotion,
  imagePromotion,
  canBeEdited,
}: ImagePromotionFormContainerProps) => {
  const { t } = useTranslation();
  const { post, patch } = useFetch();
  const [error, setError] = React.useState<unknown>();

  const isEdit = !!imagePromotion;
  const availableFormats = imageBuild.imageExports.filter(Boolean).map((e) => e?.spec.format as ExportFormatType);

  const target = parentPromotion?.spec.target;
  const [catalogItem, catalogItemLoading] = useCatalogItem(target?.catalogName, target?.catalogItemName);

  if (parentPromotion && catalogItemLoading) {
    return <LoadingModal onClose={onClose} />;
  }

  let initialValues: ImagePromotionFormValues;
  if (imagePromotion) {
    initialValues = getEditInitialValues(imagePromotion);
  } else if (parentPromotion) {
    initialValues = {
      ...getInitialValues(catalogItem),
      exportFormats: imageBuild.imageExports.filter(Boolean).map((ie) => (ie as ImageExport).spec.format),
    };
  } else {
    initialValues = {
      ...defaultInitialValues,
      exportFormats: imageBuild.imageExports.filter(Boolean).map((ie) => (ie as ImageExport).spec.format),
    };
  }

  return (
    <Formik<ImagePromotionFormValues>
      initialValues={initialValues}
      validationSchema={getImagePromotionValidationSchema(t)}
      validateOnMount
      onSubmit={async (values) => {
        if (imagePromotion) {
          const patches: PatchRequest = [];
          const originalFormats = imagePromotion.spec.source.exportFormats || [];

          if (values.additionalExportFormats) {
            patches.push({
              op: originalFormats.length === 0 ? 'add' : 'replace',
              path: '/spec/source/exportFormats',
              value: [...values.additionalExportFormats, ...originalFormats],
            });
          }

          try {
            if (patches.length > 0) {
              await patch<ImagePromotion>(`imagepromotions/${imagePromotion.metadata.name as string}`, patches);
            }
            onClose(true);
          } catch (e) {
            setError(e);
          }
        } else {
          const imagePromotion = getImagePromotion(values, imageBuild.metadata.name || '');
          try {
            await post('imagepromotions', imagePromotion);
            onClose(true);
          } catch (e) {
            setError(e);
          }
        }
      }}
    >
      {({ isValid, isSubmitting, dirty, submitForm }) => (
        <FlightCtlModal isOpen onClose={isSubmitting ? undefined : () => onClose()} variant="small">
          <ModalHeader
            title={
              isEdit ? (canBeEdited ? t('Edit image promotion') : t('View image promotion')) : t('Add build to catalog')
            }
          />
          <ModalBody>
            <ImagePromotionForm
              isEdit={isEdit}
              canAmendExportFormats={!isEdit || canBeEdited}
              availableFormats={availableFormats}
            />
            {!!error && (
              <Alert
                title={isEdit ? t('Failed to update ImagePromotion') : t('Failed to create ImagePromotion')}
                isInline
                variant="danger"
              >
                {getErrorMessage(error)}
              </Alert>
            )}
          </ModalBody>
          <ModalFooter>
            {(!isEdit || canBeEdited) && (
              <Button
                key="confirm"
                variant="primary"
                isDisabled={isSubmitting || !isValid || !dirty}
                isLoading={isSubmitting}
                onClick={submitForm}
              >
                {isEdit ? t('Save') : t('Add to catalog')}
              </Button>
            )}
            <Button key="cancel" variant="link" onClick={() => onClose()} isDisabled={isSubmitting}>
              {!isEdit || canBeEdited ? t('Cancel') : t('Close')}
            </Button>
          </ModalFooter>
        </FlightCtlModal>
      )}
    </Formik>
  );
};

const promotionPermissions = [{ kind: RESOURCE.IMAGE_PROMOTION, verb: VERB.LIST }];

const ImagePromotionModal = ({
  onClose,
  imageBuild,
  imagePromotion,
  readOnly,
}: {
  onClose: (updated?: boolean) => void;
  imageBuild: ImageBuildWithExports;
  imagePromotion?: ImagePromotion;
  readOnly?: boolean;
}) => {
  const { t } = useTranslation();
  const isEdit = !!imagePromotion;
  const availableFormats = imageBuild.imageExports.filter(Boolean).map((e) => e?.spec.format as ExportFormatType);
  const canBeEdited = !readOnly && imagePromotion ? canPromotionBeEdited(imagePromotion, availableFormats) : false;
  const parentBuildName = !isEdit ? imageBuild.metadata.annotations?.[NEW_VERSION_FROM_ANNOTATION] : undefined;
  const { checkPermissions } = usePermissionsContext();
  const [canList] = checkPermissions(promotionPermissions);

  const [promotionList, promotionsLoading, promotionsError] = useFetchPeriodically<ImagePromotionList>({
    endpoint:
      canList && parentBuildName
        ? `imagepromotions?fieldSelector=${encodeURIComponent(`spec.source.imageBuildRef=${parentBuildName}`)}`
        : '',
  });

  if (canList && parentBuildName && promotionsLoading) {
    return <LoadingModal onClose={onClose} />;
  }

  if (promotionsError) {
    return (
      <FlightCtlModal isOpen onClose={() => onClose(false)} variant="small">
        <ModalHeader title={isEdit ? t('Edit image promotion') : t('Add build to catalog')} />
        <ModalHeader
          title={
            isEdit ? (canBeEdited ? t('Edit image promotion') : t('View image promotion')) : t('Add build to catalog')
          }
        />
        <ModalBody>
          <Alert isInline variant="danger" title={t('Failed to load Image promotions')}>
            {getErrorMessage(promotionsError)}
          </Alert>
        </ModalBody>
      </FlightCtlModal>
    );
  }

  const parentPromotion = !isEdit ? getLatestPromotion(promotionList?.items || []) : undefined;

  return (
    <ImagePromotionFormContainer
      onClose={onClose}
      imageBuild={imageBuild}
      parentPromotion={parentPromotion}
      imagePromotion={imagePromotion}
      canBeEdited={canBeEdited}
    />
  );
};

export default ImagePromotionModal;
