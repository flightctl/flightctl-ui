import { Alert, Button, ModalBody, ModalFooter, ModalHeader, Spinner } from '@patternfly/react-core';
import FlightCtlModal from '@flightctl/ui-components/src/components/common/FlightCtlModal';
import { Formik } from 'formik';
import * as React from 'react';

import ImagePromotionForm, { ImagePromotionFormContent } from './ImagePromotionForm';
import { type ImagePromotionFormValues } from './types';
import {
  canPromotionBeEdited,
  defaultInitialValues,
  getAvailableExportFormats,
  getEditInitialValues,
  getImagePromotionValidationSchema,
  getInitialValues,
} from './utils';
import { useTranslation } from '../../hooks/useTranslation';
import { useFetch } from '../../hooks/useFetch';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { useCatalogItemsLookup } from '../Catalog/useCatalogItemsLookup';
import { type ImagePromotion, type ImagePromotionList } from '@flightctl/types/imagebuilder';
import { type PatchRequest } from '@flightctl/types';
import { type ImageBuildWithExports } from '../../types/extraTypes';
import { getErrorMessage } from '../../utils/error';
import { RESOURCE, VERB } from '../../types/rbac';
import { usePermissionsContext } from '../common/PermissionsContext';
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

const ImagePromotionViewModal = ({
  promotion,
  onClose,
}: {
  promotion: ImagePromotion;
  onClose: (updated?: boolean) => void;
}) => {
  const { t } = useTranslation();
  const formats = promotion.spec.source.exportFormats || [];
  return (
    <FlightCtlModal isOpen onClose={() => onClose()} variant="small">
      <ModalHeader title={t('View image promotion')} />
      <ModalBody>
        <Formik<ImagePromotionFormValues> initialValues={getEditInitialValues(promotion)} onSubmit={() => {}}>
          <ImagePromotionFormContent
            isEdit
            catalogs={{}}
            catalogItems={[]}
            canAmendExportFormats={false}
            availableFormats={formats}
          />
        </Formik>
      </ModalBody>
      <ModalFooter>
        <Button key="close" variant="link" onClick={() => onClose()}>
          {t('Close')}
        </Button>
      </ModalFooter>
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
  const availableFormats = getAvailableExportFormats(imageBuild);

  const target = parentPromotion?.spec.target;
  const hasCatalogParams = target?.catalogName && target?.catalogItemName;
  const { getItem, isLoading: catalogItemLoading } = useCatalogItemsLookup(
    hasCatalogParams ? [{ catalog: target.catalogName, item: target.catalogItemName }] : [],
  );

  if (parentPromotion && catalogItemLoading) {
    return <LoadingModal onClose={onClose} />;
  }

  let initialValues: ImagePromotionFormValues;
  if (imagePromotion) {
    initialValues = getEditInitialValues(imagePromotion);
  } else if (parentPromotion) {
    const catalogItem = hasCatalogParams ? getItem(target.catalogName, target.catalogItemName) : undefined;
    initialValues = {
      ...getInitialValues(catalogItem),
      exportFormats: getAvailableExportFormats(imageBuild),
    };
  } else {
    initialValues = {
      ...defaultInitialValues,
      exportFormats: getAvailableExportFormats(imageBuild),
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

const ImagePromotionEditorModal = ({
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
      <FlightCtlModal isOpen onClose={() => onClose(false)} variant="small">
        <ModalHeader title={isEdit ? t('Edit image promotion') : t('Add build to catalog')} />
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
      canBeEdited
    />
  );
};

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
  // Do not change modes once the modal opens, otherwise the user could lose unsaved changes
  const [isViewOnly] = React.useState(() => {
    if (!imagePromotion) {
      return false;
    }
    return !!readOnly || !canPromotionBeEdited(imagePromotion, getAvailableExportFormats(imageBuild));
  });

  if (imagePromotion && isViewOnly) {
    return <ImagePromotionViewModal promotion={imagePromotion} onClose={onClose} />;
  }

  return <ImagePromotionEditorModal onClose={onClose} imageBuild={imageBuild} imagePromotion={imagePromotion} />;
};

export default ImagePromotionModal;
