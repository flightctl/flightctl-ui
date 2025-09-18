import React from 'react';
import { DropdownItem, DropdownList, Nav, NavList } from '@patternfly/react-core';
import { Fleet } from '@flightctl/types';

import { RESOURCE, VERB } from '../../../types/rbac';
import PageWithPermissions from '../../common/PageWithPermissions';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAccessReview } from '../../../hooks/useAccessReview';
import { useAppContext } from '../../../hooks/useAppContext';
import NavItem from '../../NavItem/NavItem';
import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageActions from '../../DetailsPage/DetailsPageActions';
import DeleteFleetModal from '../DeleteFleetModal/DeleteFleetModal';
import YamlEditor from '../../common/CodeEditor/YamlEditor';
import FleetDetailsContent from './FleetDetailsContent';
import FleetRestoreBanner from './FleetRestoreBanner';

const FleetDetailPage = () => {
  const { t } = useTranslation();

  const {
    router: { useParams, Routes, Route, Navigate },
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
  const hasActions = canDelete || (canEdit && !isManaged) || isManaged;

  return (
    <DetailsPage
      loading={isLoading}
      error={error}
      id={fleetId}
      resourceLink={ROUTE.FLEETS}
      resourceType="Fleets"
      resourceTypeLabel={t('Fleets')}
      banner={<FleetRestoreBanner fleet={fleet} refetch={refetch} />}
      nav={
        <Nav variant="tertiary">
          <NavList>
            <NavItem to="details">{t('Details')}</NavItem>
            <NavItem to="yaml">{t('YAML')}</NavItem>
          </NavList>
        </Nav>
      }
      actions={
        hasActions && (
          <DetailsPageActions>
            <DropdownList>
              {isManaged && (
                <DropdownItem onClick={() => navigate({ route: ROUTE.FLEET_EDIT, postfix: fleetId })}>
                  {t('View fleet configurations')}
                </DropdownItem>
              )}
              {canEdit && !isManaged && (
                <DropdownItem onClick={() => navigate({ route: ROUTE.FLEET_EDIT, postfix: fleetId })}>
                  {t('Edit fleet configurations')}
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
          <Routes>
            <Route index element={<Navigate to="details" replace />} />
            <Route path="details" element={<FleetDetailsContent fleet={fleet} />} />
            <Route path="yaml" element={<YamlEditor filename={fleetId} apiObj={fleet} refetch={refetch} />} />
          </Routes>
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
      <FleetDetailPage />
    </PageWithPermissions>
  );
};

export default FleetDetailsWithPermissions;
