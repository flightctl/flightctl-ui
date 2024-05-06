import React from 'react';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { DeviceList, Fleet } from '@flightctl/types';

import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { useFetch } from '../../../hooks/useFetch';
import { useEditLabelsAction } from '../../../hooks/useEditLabelsAction';
import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageActions, { useDeleteAction } from '../../DetailsPage/DetailsPageActions';
import FleetDetailsContent from './FleetDetailsContent';
import { getUpdatedFleet } from '../../../utils/fleets';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';

const getFleetDeviceCount = (fleetDevicesResp: DeviceList | undefined): number | undefined => {
  if (fleetDevicesResp === undefined) {
    return undefined;
  }
  const hasItems = fleetDevicesResp.items.length > 0;
  const extraDevices = fleetDevicesResp.metadata.remainingItemCount || 0;
  return hasItems ? 1 + extraDevices : 0;
};

const FleetDetails = () => {
  const { t } = useTranslation();

  const {
    router: { useParams },
  } = useAppContext();
  const { fleetId } = useParams() as { fleetId: string };
  const [fleet, isLoading, error, refetch] = useFetchPeriodically<Required<Fleet>>({ endpoint: `fleets/${fleetId}` });
  const [fleetDevicesResp] = useFetchPeriodically<DeviceList>({ endpoint: `devices?owner=Fleet/${fleetId}&limit=1` });

  const { remove } = useFetch();
  const navigate = useNavigate();
  const { deleteAction, deleteModal } = useDeleteAction({
    onDelete: async () => {
      await remove(`fleets/${fleetId}`);
      navigate(ROUTE.FLEETS);
    },
    resourceName: fleetId,
    resourceType: 'Fleet',
    disabledReason: fleet?.metadata?.owner && t('Fleets managed by a resource sync cannot be deleted'),
  });

  const { editLabelsAction, editLabelsModal } = useEditLabelsAction<Fleet>({
    submitTransformer: getUpdatedFleet,
    resourceType: 'fleets',
    onEditSuccess: () => {
      refetch();
    },
  });

  return (
    <DetailsPage
      loading={isLoading}
      error={error}
      id={fleetId}
      resourceLink="/devicemanagement/fleets"
      resourceType="Fleets"
      resourceTypeLabel={t('Fleets')}
      actions={
        <DetailsPageActions>
          <DropdownList>
            {deleteAction}
            <DropdownItem
              {...editLabelsAction({
                resourceId: fleetId,
                disabledReason: fleet?.metadata?.owner && t('Fleets managed by a resource sync cannot be edited'),
              })}
            >
              {t('Edit labels')}
            </DropdownItem>
          </DropdownList>
        </DetailsPageActions>
      }
    >
      {fleet && (
        <>
          <FleetDetailsContent fleet={fleet} devicesCount={getFleetDeviceCount(fleetDevicesResp)} />
          {deleteModal}
          {editLabelsModal}
        </>
      )}
    </DetailsPage>
  );
};

export default FleetDetails;
