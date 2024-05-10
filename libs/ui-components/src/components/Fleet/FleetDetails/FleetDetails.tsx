import React from 'react';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { DeviceList, Fleet } from '@flightctl/types';

import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageActions from '../../DetailsPage/DetailsPageActions';
import FleetDetailsContent from './FleetDetailsContent';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';
import DeleteFleetModal from '../DeleteFleetModal/DeleteFleetModal';
import { getApiListCount } from '../../../utils/api';

const FleetDetails = () => {
  const { t } = useTranslation();

  const {
    router: { useParams },
  } = useAppContext();
  const { fleetId } = useParams() as { fleetId: string };
  const [fleet, isLoading, error, refetch] = useFetchPeriodically<Required<Fleet>>({ endpoint: `fleets/${fleetId}` });
  const [fleetDevicesResp] = useFetchPeriodically<DeviceList>({ endpoint: `devices?owner=Fleet/${fleetId}&limit=1` });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState<boolean>();

  const navigate = useNavigate();

  const isManaged = !!fleet?.metadata?.owner;

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
            <DropdownItem
              isAriaDisabled={isManaged}
              tooltipProps={
                isManaged
                  ? {
                      content: t('Fleets managed by a resource sync cannot be edited'),
                    }
                  : undefined
              }
              onClick={() => navigate({ route: ROUTE.FLEET_EDIT, postfix: fleetId })}
            >
              {t('Edit')}
            </DropdownItem>
            <DropdownItem
              title={t('Delete')}
              onClick={() => {
                setIsDeleteModalOpen(true);
              }}
            >
              {t('Delete')}
            </DropdownItem>
          </DropdownList>
        </DetailsPageActions>
      }
    >
      {fleet && (
        <>
          <FleetDetailsContent fleet={fleet} devicesCount={getApiListCount(fleetDevicesResp)} />
          {isDeleteModalOpen && (
            <DeleteFleetModal
              fleetId={fleetId}
              onClose={(hasDeleted?: boolean) => {
                if (hasDeleted) {
                  refetch();
                  navigate(ROUTE.FLEETS);
                }
                setIsDeleteModalOpen(false);
              }}
            />
          )}
        </>
      )}
    </DetailsPage>
  );
};

export default FleetDetails;
