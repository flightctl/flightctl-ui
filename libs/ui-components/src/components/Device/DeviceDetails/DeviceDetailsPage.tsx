import * as React from 'react';
import { DropdownItem, DropdownList, Nav, NavList } from '@patternfly/react-core';

import { Device } from '@flightctl/types';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { useFetch } from '../../../hooks/useFetch';
import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageActions, { useDeleteAction } from '../../DetailsPage/DetailsPageActions';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';
import DeviceDetailsTab from './DeviceDetailsTab';
import TerminalTab from './TerminalTab';
import NavItem from '../../NavItem/NavItem';
import DeviceStatusDebugModal from './DeviceStatusDebugModal';
import { getDeviceFleet } from '../../../utils/devices';
import { RESOURCE, VERB } from '../../../types/rbac';
import { useAccessReview } from '../../../hooks/useAccessReview';

const DeviceDetailsPage = ({ children, hideTerminal }: React.PropsWithChildren<{ hideTerminal?: boolean }>) => {
  const { t } = useTranslation();
  const {
    router: { useParams, Routes, Route, Navigate },
  } = useAppContext();
  const { deviceId } = useParams() as { deviceId: string };
  const [device, loading, error, refetch] = useFetchPeriodically<Required<Device>>({ endpoint: `devices/${deviceId}` });
  const [showDebugInfo, setShowDebugInfo] = React.useState<boolean>(false);

  const navigate = useNavigate();
  const { remove } = useFetch();

  const deviceAlias = device?.metadata.labels?.alias || deviceId;

  const [canDelete] = useAccessReview(RESOURCE.DEVICE, VERB.DELETE);
  const [canEdit] = useAccessReview(RESOURCE.DEVICE, VERB.PATCH);

  const { deleteAction, deleteModal } = useDeleteAction({
    onDelete: async () => {
      await remove(`devices/${deviceId}`);
      navigate(ROUTE.DEVICES);
    },
    resourceName: deviceAlias,
    resourceType: 'device',
  });
  const editActionProps = getDeviceFleet(device?.metadata || {})
    ? {
        isAriaDisabled: true,
        tooltipProps: {
          content: t('Device is bound to a fleet. Its configurations cannot be edited'),
        },
      }
    : undefined;

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
            <NavItem to="terminal">{t('Terminal')}</NavItem>
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
              <DeviceDetailsTab device={device} refetch={refetch} canEdit={canEdit}>
                {children}
              </DeviceDetailsTab>
            }
          />
          {!hideTerminal && <Route path="terminal" element={<TerminalTab device={device} />} />}
        </Routes>
      )}
      {deleteModal}
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

export default DeviceDetailsPage;
