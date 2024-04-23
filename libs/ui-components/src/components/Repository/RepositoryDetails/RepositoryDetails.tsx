import * as React from 'react';
import { DropdownItem, DropdownList, Nav, NavList } from '@patternfly/react-core';

import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { Repository } from '@flightctl/types';

import NavItem from '../../NavItem/NavItem';
import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageActions from '../../DetailsPage/DetailsPageActions';
import DetailsTab from './Tabs/DetailsTab';
import ResourceSyncsTab from './Tabs/ResourceSyncsTab';
import DeleteRepositoryModal from './DeleteRepositoryModal';
import { useTranslation } from 'react-i18next';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';

const RepositoryDetails = () => {
  const { t } = useTranslation();
  const {
    router: { useParams, Navigate, Route, Routes },
  } = useAppContext();
  const { repositoryId } = useParams() as { repositoryId: string };
  const [repoDetails, isLoading, error] = useFetchPeriodically<Required<Repository>>({
    endpoint: `repositories/${repositoryId}`,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState<boolean>(false);

  const navigate = useNavigate();

  const onDeleteSuccess = () => {
    navigate(ROUTE.REPOSITORIES);
  };

  return (
    <DetailsPage
      loading={isLoading}
      error={error}
      id={repositoryId}
      title={repoDetails?.metadata.name as string}
      resourceLink="/devicemanagement/repositories"
      resourceType="Repositories"
      actions={
        <DetailsPageActions>
          <DropdownList>
            <DropdownItem onClick={() => navigate({ route: ROUTE.REPO_EDIT, postfix: repositoryId })}>
              {t('Edit repository')}
            </DropdownItem>
            <DropdownItem onClick={() => setIsDeleteModalOpen(true)}>{t('Delete repository')}</DropdownItem>
          </DropdownList>
        </DetailsPageActions>
      }
      nav={
        <Nav variant="tertiary">
          <NavList>
            <NavItem to="details">{t('Details')}</NavItem>
            <NavItem to="resourcesyncs">{t('Resource syncs')}</NavItem>
          </NavList>
        </Nav>
      }
    >
      {repoDetails && (
        <>
          <Routes>
            <Route index element={<Navigate to="details" replace />} />
            <Route path="details" element={<DetailsTab repoDetails={repoDetails} />} />
            <Route path="resourcesyncs" element={<ResourceSyncsTab repositoryId={repositoryId} />} />
          </Routes>
          {isDeleteModalOpen && (
            <DeleteRepositoryModal
              onClose={() => setIsDeleteModalOpen(false)}
              onDeleteSuccess={onDeleteSuccess}
              repositoryId={repositoryId}
            />
          )}
        </>
      )}
    </DetailsPage>
  );
};

export default RepositoryDetails;
