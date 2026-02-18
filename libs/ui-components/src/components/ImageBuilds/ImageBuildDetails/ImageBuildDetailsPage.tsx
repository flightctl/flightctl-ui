import * as React from 'react';
import { DropdownItem, DropdownList, Tab } from '@patternfly/react-core';

import { ImageBuildConditionReason } from '@flightctl/types/imagebuilder';
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

const imageBuildDetailsPermissions = [
  { kind: RESOURCE.IMAGE_BUILD, verb: VERB.CREATE },
  { kind: RESOURCE.IMAGE_BUILD_CANCEL, verb: VERB.CREATE },
  { kind: RESOURCE.IMAGE_BUILD, verb: VERB.DELETE },
  // Users that can view logs for imagebuilds also can view logs for imageexports
  { kind: RESOURCE.IMAGE_BUILD_LOG, verb: VERB.GET },
];

const ImageBuildDetailsPageContent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    router: { useParams, Routes, Route, Navigate },
  } = useAppContext();

  const { imageBuildId } = useParams() as { imageBuildId: string };
  const [imageBuild, isLoading, error, refetch] = useImageBuild(imageBuildId);
  const { checkPermissions } = usePermissionsContext();
  const buildReason = imageBuild ? getImageBuildStatusReason(imageBuild) : undefined;
  const [canCreate, hasCancelPermission, canDelete, canViewLogs] = checkPermissions(imageBuildDetailsPermissions);
  const canCancel = hasCancelPermission && buildReason && isImageBuildCancelable(buildReason);

  const tabKeys = React.useMemo(
    () => (canViewLogs ? ['details', 'exports', 'yaml', 'logs'] : ['details', 'exports', 'yaml']),
    [canViewLogs],
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState<boolean>();
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState<boolean>();

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
        (canCreate || canDelete) && (
          <DetailsPageActions>
            <DropdownList>
              {canCreate && (
                <DropdownItem onClick={() => navigate({ route: ROUTE.IMAGE_BUILD_EDIT, postfix: imageBuildId })}>
                  {buildReason === ImageBuildConditionReason.ImageBuildConditionReasonFailed
                    ? t('Retry')
                    : t('Duplicate')}
                </DropdownItem>
              )}
              {canCancel && (
                <DropdownItem onClick={() => setIsCancelModalOpen(true)}>{t('Cancel image build')}</DropdownItem>
              )}
              {canDelete && !canCancel && (
                <DropdownItem onClick={() => setIsDeleteModalOpen(true)}>{t('Delete image build')}</DropdownItem>
              )}
            </DropdownList>
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
        <ImageBuildDetailsPageContent />
      </OciRegistriesContextProvider>
    </PageWithPermissions>
  );
};

export default ImageBuildDetailsWithPermissions;
