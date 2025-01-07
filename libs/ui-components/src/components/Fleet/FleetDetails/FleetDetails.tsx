import React from 'react';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { Fleet } from '@flightctl/types';

import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageActions from '../../DetailsPage/DetailsPageActions';
import FleetDetailsContent from './FleetDetailsContent';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';
import DeleteFleetModal from '../DeleteFleetModal/DeleteFleetModal';
import { useAccessReview } from '../../../hooks/useAccessReview';
import { RESOURCE, VERB } from '../../../types/rbac';
import PageWithPermissions from '../../common/PageWithPermissions';

const FleetDetails = () => {
  const { t } = useTranslation();

  const {
    router: { useParams },
  } = useAppContext();
  const { fleetId } = useParams() as { fleetId: string };
  const [fleet, isLoading, error, refetch] = useFetchPeriodically<Required<Fleet>>({
    endpoint: `fleets/${fleetId}?addDevicesSummary=true`,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState<boolean>();

  const navigate = useNavigate();

  const [canDelete] = useAccessReview(RESOURCE.FLEET, VERB.DELETE);
  const [canEdit] = useAccessReview(RESOURCE.FLEET, VERB.PATCH);

  const isManaged = !!fleet?.metadata?.owner;

  return (
    <DetailsPage
      loading={isLoading}
      error={error}
      id={fleetId}
      resourceLink={ROUTE.FLEETS}
      resourceType="Fleets"
      resourceTypeLabel={t('Fleets')}
      actions={
        (canDelete || canEdit) && (
          <DetailsPageActions>
            <DropdownList>
              {canEdit && (
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
                  {t('Edit fleet')}
                </DropdownItem>
              )}
              {canDelete && (
                <DropdownItem
                  title={t('Delete fleet')}
                  onClick={() => {
                    setIsDeleteModalOpen(true);
                  }}
                  isAriaDisabled={isManaged}
                  tooltipProps={
                    isManaged
                      ? {
                          content: t(
                            "This fleet is managed by a resource sync and cannot be directly deleted. Either remove this fleet's definition from the resource sync configuration, or delete the resource sync first.",
                          ),
                        }
                      : undefined
                  }
                >
                  {t('Delete fleet')}
                </DropdownItem>
              )}
            </DropdownList>
          </DetailsPageActions>
        )
      }
    >
      {fleet && (
        <>
          <FleetDetailsContent fleet={fleet} />
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

const FleetDetailsWithPermissions = () => {
  const [allowed, loading] = useAccessReview(RESOURCE.FLEET, VERB.GET);
  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <FleetDetails />
    </PageWithPermissions>
  );
};

export default FleetDetailsWithPermissions;
