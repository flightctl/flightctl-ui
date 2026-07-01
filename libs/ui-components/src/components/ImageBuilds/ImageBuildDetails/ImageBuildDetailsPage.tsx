import * as React from 'react';
import { DropdownItem, Tab } from '@patternfly/react-core';

import { RESOURCE, VERB } from '../../../types/rbac';
import PageWithPermissions from '../../common/PageWithPermissions';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { usePermissionsContext } from '../../common/PermissionsContext';
import { useAppContext } from '../../../hooks/useAppContext';
import { getImageBuildStatusReason, isImageBuildCancelable } from '../../../utils/imageBuilds';
import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageActions from '../../DetailsPage/DetailsPageActions';
import DeleteImageBuildModal from '../DeleteImageBuildModal/DeleteImageBuildModal';
import { useImageBuild } from '../useImageBuilds';
import TabsNav from '../../TabsNav/TabsNav';
import { OciRegistriesContextProvider } from '../OciRegistriesContext';
import ImageBuildYaml from './ImageBuildYaml';
import ImageBuildDetailsTab from './ImageBuildDetailsTab';
import ImageBuildExportsGallery from './ImageBuildExportsGallery';
import ImageBuildLogsTab from './ImageBuildLogsTab';
import CancelImageBuildModal from '../CancelImageBuildModal/CancelImageBuildModal';
import ImagePromotionModal from '../../ImagePromotion/ImagePromotionModal';
import { ImagePromotionsContextProvider, useImagePromotionsContext } from '../ImagePromotionsContext';
import ActionsDropdownList from '../../common/ActionsDropdownList';

const imageBuildDetailsPermissions = [
  { kind: RESOURCE.IMAGE_BUILD_CANCEL, verb: VERB.CREATE },
  { kind: RESOURCE.IMAGE_BUILD, verb: VERB.DELETE },
  { kind: RESOURCE.IMAGE_BUILD_NEW_VERSION, verb: VERB.CREATE },
  // Users that can view logs for imagebuilds also can view logs for imageexports
  { kind: RESOURCE.IMAGE_BUILD_LOG, verb: VERB.GET },
  { kind: RESOURCE.IMAGE_PROMOTION, verb: VERB.CREATE },
];

const ImageBuildDetailsPageContent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    router: { useParams, Routes, Route, Navigate },
  } = useAppContext();
  const { refetchPromotions } = useImagePromotionsContext();

  const { imageBuildId } = useParams() as { imageBuildId: string };
  const [imageBuild, isLoading, error, refetch] = useImageBuild(imageBuildId);
  const { checkPermissions } = usePermissionsContext();
  const buildReason = imageBuild ? getImageBuildStatusReason(imageBuild) : undefined;
  const [hasCancelPermission, canDelete, canNewVersion, canViewLogs, canPromote] =
    checkPermissions(imageBuildDetailsPermissions);
  const canCancel = hasCancelPermission && buildReason && isImageBuildCancelable(buildReason);

  const tabKeys = React.useMemo(
    () => (canViewLogs ? ['details', 'exports', 'yaml', 'logs'] : ['details', 'exports', 'yaml']),
    [canViewLogs],
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState<boolean>();
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState<boolean>();
  const [isImagePromotionOpen, setIsImagePromotionOpen] = React.useState<boolean>();

  return (
    <DetailsPage
      loading={isLoading}
      error={error}
      id={imageBuildId}
      resourceLink={ROUTE.IMAGE_BUILDS}
      resourceType="Image builds"
      resourceTypeLabel={t('Image builds')}
      nav={
        <TabsNav aria-label="Image build details tabs" tabKeys={tabKeys}>
          <Tab eventKey="details" title={t('Base image')} />
          <Tab eventKey="exports" title={t('Export images')} />
          <Tab eventKey="yaml" title={t('YAML')} />
          {canViewLogs && <Tab eventKey="logs" title={t('Logs')} />}
        </TabsNav>
      }
      actions={
        (canPromote || canNewVersion || canDelete || canCancel) && (
          <DetailsPageActions>
            <ActionsDropdownList>
              {canNewVersion && (
                <ActionsDropdownList.Item>
                  <DropdownItem
                    onClick={() => navigate({ route: ROUTE.IMAGE_BUILD_NEW_VERSION, postfix: imageBuildId })}
                  >
                    {t('Rebuild')}
                  </DropdownItem>
                </ActionsDropdownList.Item>
              )}
              {canPromote && (
                <ActionsDropdownList.Item>
                  <DropdownItem onClick={() => setIsImagePromotionOpen(true)}>{t('Add to catalog')}</DropdownItem>
                </ActionsDropdownList.Item>
              )}
              {canCancel && (
                <ActionsDropdownList.Item isDanger>
                  <DropdownItem onClick={() => setIsCancelModalOpen(true)}>{t('Cancel image build')}</DropdownItem>
                </ActionsDropdownList.Item>
              )}
              {canDelete && !canCancel && (
                <ActionsDropdownList.Item isDanger>
                  <DropdownItem onClick={() => setIsDeleteModalOpen(true)}>{t('Delete image build')}</DropdownItem>
                </ActionsDropdownList.Item>
              )}
            </ActionsDropdownList>
          </DetailsPageActions>
        )
      }
    >
      {imageBuild && (
        <>
          <Routes>
            <Route index element={<Navigate to="details" replace />} />
            <Route path="details" element={<ImageBuildDetailsTab imageBuild={imageBuild} />} />
            <Route path="exports" element={<ImageBuildExportsGallery imageBuild={imageBuild} refetch={refetch} />} />
            <Route path="yaml" element={<ImageBuildYaml imageBuild={imageBuild} refetch={refetch} />} />
            {canViewLogs && <Route path="logs" element={<ImageBuildLogsTab imageBuild={imageBuild} />} />}
          </Routes>
          {isDeleteModalOpen && (
            <DeleteImageBuildModal
              imageBuildId={imageBuildId}
              onClose={(hasDeleted?: boolean) => {
                if (hasDeleted) {
                  navigate(ROUTE.IMAGE_BUILDS);
                }
                setIsDeleteModalOpen(false);
              }}
            />
          )}
          {isCancelModalOpen && (
            <CancelImageBuildModal
              imageBuildId={imageBuildId}
              onClose={(confirmed) => {
                setIsCancelModalOpen(false);
                if (confirmed) {
                  refetch();
                }
              }}
            />
          )}
          {isImagePromotionOpen && (
            <ImagePromotionModal
              onClose={(updated) => {
                setIsImagePromotionOpen(false);
                if (updated) {
                  refetchPromotions();
                }
              }}
              imageBuild={imageBuild}
            />
          )}
        </>
      )}
    </DetailsPage>
  );
};

const ImageBuildDetailsWithPermissions = () => {
  const { checkPermissions, loading } = usePermissionsContext();
  const [allowed] = checkPermissions([{ kind: RESOURCE.IMAGE_BUILD, verb: VERB.GET }]);
  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <OciRegistriesContextProvider>
        <ImagePromotionsContextProvider>
          <ImageBuildDetailsPageContent />
        </ImagePromotionsContextProvider>
      </OciRegistriesContextProvider>
    </PageWithPermissions>
  );
};

export default ImageBuildDetailsWithPermissions;
