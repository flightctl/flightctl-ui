import * as React from 'react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { DropdownList, Nav, NavList } from '@patternfly/react-core';

import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { Repository } from '@types';

import { useFetch } from '@app/hooks/useFetch';
import NavItem from '@app/components/NavItem/NavItem';
import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageActions, { useDeleteAction } from '../../DetailsPage/DetailsPageActions';
import DetailsTab from './Tabs/DetailsTab';
import ResourceSyncsTab from './Tabs/ResourceSyncsTab';

const RepositoryDetails = () => {
  const { repositoryId } = useParams() as { repositoryId: string };
  const [repoDetails, isLoading, error] = useFetchPeriodically<Required<Repository>>({
    endpoint: `repositories/${repositoryId}`,
  });

  const { remove } = useFetch();
  const navigate = useNavigate();
  const { deleteAction, deleteModal } = useDeleteAction({
    onDelete: async () => {
      await remove(`repositories/${repositoryId}`);
      navigate('/administration/repositories');
    },
    resourceName: repositoryId,
    resourceType: 'Repository',
  });

  return (
    <DetailsPage
      loading={isLoading}
      error={error}
      id={repositoryId}
      title={repoDetails?.metadata.name as string}
      resourceLink="/administration/repositories"
      resourceType="Repositories"
      actions={
        <DetailsPageActions>
          <DropdownList>{deleteAction}</DropdownList>
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
          {deleteModal}
        </>
      )}
    </DetailsPage>
  );
};

export default RepositoryDetails;
