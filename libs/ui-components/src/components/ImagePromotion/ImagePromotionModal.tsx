import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from '@patternfly/react-core';
import { Formik } from 'formik';
import * as React from 'react';

import ImagePromotionForm from './ImagePromotionForm';
import { ImagePromotionFormValues } from './types';
import { defaultInitialValues, getEditInitialValues, getInitialValues } from './utils';
import { useTranslation } from '../../hooks/useTranslation';
import { useFetch } from '../../hooks/useFetch';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { useCatalogItem } from '../Catalog/useCatalogs';
import {
  ApiVersion,
  ExistingCatalogItemTarget,
  ExportFormatType,
  ImageExport,
  ImagePromotion,
  ImagePromotionList,
  NewCatalogItemTarget,
} from '@flightctl/types/imagebuilder';
import { PatchRequest } from '@flightctl/types';
import { getErrorMessage } from '../../utils/error';
import { getImagePromotionValidationSchema } from './utils';
import { RESOURCE, VERB } from '../../types/rbac';
import { usePermissionsContext } from '../common/PermissionsContext';
import { ImageBuildWithExports } from '../../types/extraTypes';

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
    <Modal isOpen onClose={onClose} variant="small">
      <ModalHeader title={t('Add build to catalog')} />
      <ModalBody>
        <Spinner />
      </ModalBody>
    </Modal>
  );
};

type ImagePromotionFormContainerProps = {
  onClose: (updated?: boolean) => void;
  imageBuild: ImageBuildWithExports;
  parentPromotion: ImagePromotion | undefined;
  imagePromotion?: ImagePromotion;
};

const ImagePromotionFormContainer = ({
  onClose,
  imageBuild,
  parentPromotion,
  imagePromotion,
}: ImagePromotionFormContainerProps) => {
  const { t } = useTranslation();
  const { post, patch } = useFetch();
  const [error, setError] = React.useState<unknown>();

  const isEdit = !!imagePromotion;

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
          let promotionTarget: NewCatalogItemTarget | ExistingCatalogItemTarget;
          if (values.type === 'new') {
            promotionTarget = {
              catalogItemName: values.new.name,
              catalogName: values.catalog,
              type: NewCatalogItemTarget.type.NEW_CATALOG_ITEM,
              version: values.new.version,
              readme: values.new.readme,
            } as NewCatalogItemTarget;
          } else {
            promotionTarget = {
              type: ExistingCatalogItemTarget.type.EXISTING_CATALOG_ITEM,
              catalogItemName: values.existing.name,
              catalogName: values.catalog,
              version: values.existing.version,
              readme: values.existing.readme,
              replaces: values.existing.replaces,
              skipRange: values.existing.skipRange,
              skips: values.existing.skips
                ? values.existing.skips
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [],
            } as ExistingCatalogItemTarget;
          }

          const newImagePromotion: ImagePromotion = {
            apiVersion: ApiVersion.ApiVersionV1alpha1,
            kind: 'ImagePromotion',
            metadata: {
              name: values.name,
            },
            spec: {
              source: {
                imageBuildRef: imageBuild.metadata.name || '',
                exportFormats: values.exportFormats.length > 0 ? values.exportFormats : undefined,
              },
              target: promotionTarget,
            },
          };
          try {
            await post('imagepromotions', newImagePromotion);
            onClose(true);
          } catch (e) {
            setError(e);
          }
        }
      }}
    >
      {({ isValid, isSubmitting, dirty, submitForm }) => (
        <Modal isOpen onClose={isSubmitting ? undefined : () => onClose()} variant="small">
          <ModalHeader title={isEdit ? t('Edit image promotion') : t('Add build to catalog')} />
          <ModalBody>
            <ImagePromotionForm
              isEdit={isEdit}
              availableFormats={imageBuild.imageExports.filter(Boolean).map((e) => e?.spec.format as ExportFormatType)}
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
            <Button
              key="confirm"
              variant="primary"
              isDisabled={isSubmitting || !isValid || !dirty}
              isLoading={isSubmitting}
              onClick={submitForm}
            >
              {isEdit ? t('Save') : t('Add to catalog')}
            </Button>
            <Button key="cancel" variant="link" onClick={() => onClose()} isDisabled={isSubmitting}>
              {t('Cancel')}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Formik>
  );
};

const promotionPermissions = [{ kind: RESOURCE.IMAGE_PROMOTION, verb: VERB.LIST }];

const ImagePromotionModal = ({
  onClose,
  imageBuild,
  imagePromotion,
}: {
  onClose: (updated?: boolean) => void;
  imageBuild: ImageBuildWithExports;
  imagePromotion?: ImagePromotion;
}) => {
  const { t } = useTranslation();
  const isEdit = !!imagePromotion;
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
      <Modal isOpen onClose={() => onClose(false)} variant="small">
        <ModalHeader title={isEdit ? t('Edit image promotion') : t('Add build to catalog')} />
        <ModalBody>
          <Alert isInline variant="danger" title={t('Failed to load Image promotions')}>
            {getErrorMessage(promotionsError)}
          </Alert>
        </ModalBody>
      </Modal>
    );
  }

  const parentPromotion = !isEdit ? getLatestPromotion(promotionList?.items || []) : undefined;

  return (
    <ImagePromotionFormContainer
      onClose={onClose}
      imageBuild={imageBuild}
      parentPromotion={parentPromotion}
      imagePromotion={imagePromotion}
    />
  );
};

export default ImagePromotionModal;
