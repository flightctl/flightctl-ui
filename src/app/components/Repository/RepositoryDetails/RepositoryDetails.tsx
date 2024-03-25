import * as React from 'react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { DropdownItem, DropdownList, Nav, NavList } from '@patternfly/react-core';

import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { Repository } from '@types';

import NavItem from '@app/components/NavItem/NavItem';
import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageActions from '../../DetailsPage/DetailsPageActions';
import DetailsTab from './Tabs/DetailsTab';
import ResourceSyncsTab from './Tabs/ResourceSyncsTab';
import DeleteRepositoryModal from './DeleteRepositoryModal';

const RepositoryDetails = () => {
  const { repositoryId } = useParams() as { repositoryId: string };
  const [repoDetails, isLoading, error] = useFetchPeriodically<Required<Repository>>({
    endpoint: `repositories/${repositoryId}`,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState<boolean>(false);

  const navigate = useNavigate();

  const onDeleteSuccess = () => {
    navigate('/devicemanagement/repositories');
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
            <DropdownItem onClick={() => setIsDeleteModalOpen(true)}>Delete</DropdownItem>
          </DropdownList>
        </DetailsPageActions>
      }
      nav={
        <Nav variant="tertiary">
          <NavList>
            <NavItem to="details">Details</NavItem>
            <NavItem to="resourcesyncs">Resource syncs</NavItem>
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
