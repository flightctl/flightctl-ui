import * as React from 'react';
import { DropdownItem, DropdownList, Nav, NavList } from '@patternfly/react-core';

import { Device, DeviceDecommission, DeviceDecommissionTargetType } from '@flightctl/types';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { useFetch } from '../../../hooks/useFetch';
import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageActions, { useDecommissionAction, useDeleteAction } from '../../DetailsPage/DetailsPageActions';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';
import DeviceDetailsTab from './DeviceDetailsTab';
import TerminalTab from './TerminalTab';
import NavItem from '../../NavItem/NavItem';
import DeviceStatusDebugModal from './DeviceStatusDebugModal';
import { getDisabledTooltipProps } from '../../../utils/tooltip';
import { hasDecommissioningStarted } from '../../../utils/devices';
import { getDecommissionDisabledReason, getDeleteDisabledReason, getEditDisabledReason } from '../../../utils/devices';
import { RESOURCE, VERB } from '../../../types/rbac';
import { useAccessReview } from '../../../hooks/useAccessReview';
import PageWithPermissions from '../../common/PageWithPermissions';

type DeviceDetailsPageProps = React.PropsWithChildren<{ hideTerminal?: boolean }>;

const DeviceDetailsPage = ({ children, hideTerminal }: DeviceDetailsPageProps) => {
  const { t } = useTranslation();
  const {
    router: { useParams, Routes, Route, Navigate },
  } = useAppContext();
  const { deviceId } = useParams() as { deviceId: string };
  const [device, loading, error, refetch] = useFetchPeriodically<Required<Device>>({ endpoint: `devices/${deviceId}` });
  const [showDebugInfo, setShowDebugInfo] = React.useState<boolean>(false);

  const navigate = useNavigate();
  const { remove, put } = useFetch();

  const deviceAlias = device?.metadata.labels?.alias || deviceId;

  const [canDelete] = useAccessReview(RESOURCE.DEVICE, VERB.DELETE);
  const [canEdit] = useAccessReview(RESOURCE.DEVICE, VERB.PATCH);
  const [canOpenTerminal] = useAccessReview(RESOURCE.DEVICE_CONSOLE, VERB.GET);
  const [canDecommission] = useAccessReview(RESOURCE.DEVICE_DECOMMISSION, VERB.UPDATE);

  const isEditable = (canEdit && device && !hasDecommissioningStarted(device)) || false;

  const { deleteAction, deleteModal } = useDeleteAction({
    resourceType: 'device',
    resourceName: deviceAlias,
    disabledReason: device ? getDeleteDisabledReason(device, t) : undefined,
    onDelete: async () => {
      await remove(`devices/${deviceId}`);
      navigate(ROUTE.DEVICES);
    },
  });

  const { decommissionAction, decommissionModal } = useDecommissionAction({
    disabledReason: device ? getDecommissionDisabledReason(device, t) : undefined,
    onDecommission: async (target: DeviceDecommissionTargetType) => {
      await put<DeviceDecommission>(`devices/${deviceId}/decommission`, {
        target,
      });
    },
  });

  const editActionProps = device ? getDisabledTooltipProps(getEditDisabledReason(device, t)) : undefined;

  return (
    <DetailsPage
      loading={loading}
      error={error}
      id={deviceId}
      title={deviceAlias}
      resourceLink={ROUTE.DEVICES}
      resourceType="Devices"
      resourceTypeLabel={t('Devices')}
      nav={
        <Nav variant="tertiary">
          <NavList>
            <NavItem to="details">{t('Details')}</NavItem>
            {!hideTerminal && canOpenTerminal && <NavItem to="terminal">{t('Terminal')}</NavItem>}
          </NavList>
        </Nav>
      }
      actions={
        <DetailsPageActions>
          <DropdownList>
            {canEdit && (
              <DropdownItem
                onClick={() => navigate({ route: ROUTE.DEVICE_EDIT, postfix: deviceId })}
                {...editActionProps}
              >
                {t('Edit device configurations')}
              </DropdownItem>
            )}
            {canDecommission && decommissionAction}
            {canDelete && deleteAction}

            <DropdownItem
              onClick={() => {
                setShowDebugInfo(!showDebugInfo);
              }}
            >
              {t('View status debug information')}
            </DropdownItem>
          </DropdownList>
        </DetailsPageActions>
      }
    >
      {device && (
        <Routes>
          <Route index element={<Navigate to="details" replace />} />
          <Route
            path="details"
            element={
              <DeviceDetailsTab device={device} refetch={refetch} canEdit={isEditable}>
                {children}
              </DeviceDetailsTab>
            }
          />
          {!hideTerminal && canOpenTerminal && <Route path="terminal" element={<TerminalTab device={device} />} />}
        </Routes>
      )}
      {deleteModal || decommissionModal}
      {device && showDebugInfo && (
        <DeviceStatusDebugModal
          status={device.status}
          onClose={() => {
            setShowDebugInfo(false);
          }}
        />
      )}
    </DetailsPage>
  );
};

const DeviceDetailsPageWithPermissions = (props: DeviceDetailsPageProps) => {
  const [allowed, loading] = useAccessReview(RESOURCE.DEVICE, VERB.GET);
  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <DeviceDetailsPage {...props} />
    </PageWithPermissions>
  );
};

export default DeviceDetailsPageWithPermissions;
