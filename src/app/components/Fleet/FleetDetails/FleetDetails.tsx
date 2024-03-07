import React from 'react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';

import { Fleet } from '@types';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';

import DetailsPage from '../../DetailsPage/DetailsPage';
import { DropdownList, Nav, NavList } from '@patternfly/react-core';
import DetailsPageActions, { useDeleteAction } from '../../DetailsPage/DetailsPageActions';
import { useFetch } from '@app/hooks/useFetch';
import DetailsTab from './Tabs/DetailsTab';
import FleetDevicesTab from './Tabs/FleetDevicesTab';
import NavItem from '@app/components/NavItem/NavItem';

const FleetDetails = () => {
  const { fleetId } = useParams();
  const [fleet, isLoading, error] = useFetchPeriodically<Required<Fleet>>({ endpoint: `fleets/${fleetId}` });
  const { remove } = useFetch();
  const navigate = useNavigate();
  const { deleteAction, deleteModal } = useDeleteAction({
    onDelete: async () => {
      await remove(`fleets/${fleet?.metadata.name}`);
      navigate('/devicemanagement/fleets');
    },
    resourceName: fleet?.metadata.name || '',
    resourceType: 'Fleet',
  });

  return (
    <DetailsPage
      loading={isLoading}
      error={error}
      title={fleetId}
      resourceLink="/devicemanagement/fleets"
      resourceName="Fleets"
      actions={
        <DetailsPageActions>
          <DropdownList>{deleteAction}</DropdownList>
        </DetailsPageActions>
      }
      nav={
        <Nav variant="tertiary">
          <NavList>
            <NavItem to="details">Details</NavItem>
            <NavItem to="devices">Devices</NavItem>
          </NavList>
        </Nav>
      }
    >
      {fleet && (
        <>
          <Routes>
            <Route index element={<Navigate to="details" replace />} />
            <Route path="details" element={<DetailsTab fleet={fleet} />} />
            <Route path="devices" element={<FleetDevicesTab fleetName={fleet.metadata.name || ''} />} />
          </Routes>
          {deleteModal}
        </>
      )}
    </DetailsPage>
  );
};

export default FleetDetails;
