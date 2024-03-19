import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DropdownList } from '@patternfly/react-core';

import { DeviceList, Fleet } from '@types';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { useFetch } from '@app/hooks/useFetch';
import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageActions, { useDeleteAction } from '../../DetailsPage/DetailsPageActions';
import FleetDetailsContent from './FleetDetailsContent';

const getFleetDeviceCount = (fleetDevicesResp: DeviceList | undefined): number | undefined => {
  if (fleetDevicesResp === undefined) {
    return undefined;
  }
  const hasItems = fleetDevicesResp.items.length > 0;
  const extraDevices = fleetDevicesResp.metadata.remainingItemCount || 0;
  return hasItems ? 1 + extraDevices : 0;
};

const FleetDetails = () => {
  const { fleetId } = useParams() as { fleetId: string };
  const [fleet, isLoading, error] = useFetchPeriodically<Required<Fleet>>({ endpoint: `fleets/${fleetId}` });
  const [fleetDevicesResp] = useFetchPeriodically<DeviceList>({ endpoint: `devices?owner=Fleet/${fleetId}&limit=1` });

  const { remove } = useFetch();
  const navigate = useNavigate();
  const { deleteAction, deleteModal } = useDeleteAction({
    onDelete: async () => {
      await remove(`fleets/${fleet?.metadata.name}`);
      navigate('/devicemanagement/fleets');
    },
    resourceName: fleet?.metadata.name || '',
    resourceType: 'Fleet',
    disabledReason: fleet?.metadata?.owner && 'Fleets managed by a Resourcesync cannot be deleted',
  });

  return (
    <DetailsPage
      loading={isLoading}
      error={error}
      id={fleetId}
      resourceLink="/devicemanagement/fleets"
      resourceType="Fleets"
      actions={
        <DetailsPageActions>
          <DropdownList>{deleteAction}</DropdownList>
        </DetailsPageActions>
      }
    >
      {fleet && (
        <>
          <FleetDetailsContent fleet={fleet} devicesCount={getFleetDeviceCount(fleetDevicesResp)} />
          {deleteModal}
        </>
      )}
    </DetailsPage>
  );
};

export default FleetDetails;
