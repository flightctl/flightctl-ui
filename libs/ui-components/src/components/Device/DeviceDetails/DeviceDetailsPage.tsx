import * as React from 'react';
import { DropdownItem, DropdownList, Nav, NavList } from '@patternfly/react-core';

import { Device, DeviceDecommission } from '@flightctl/types';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { useFetch } from '../../../hooks/useFetch';
import { getDisabledTooltipProps } from '../../../utils/tooltip';
import { getDecommissionDisabledReason, getEditDisabledReason } from '../../../utils/devices';
import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageActions, { useDecommissionAction } from '../../DetailsPage/DetailsPageActions';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';
import DeviceDetailsTab from './DeviceDetailsTab';
import TerminalTab from './TerminalTab';
import NavItem from '../../NavItem/NavItem';
import DeviceStatusDebugModal from './DeviceStatusDebugModal';

const DeviceDetailsPage = ({ children, hideTerminal }: React.PropsWithChildren<{ hideTerminal?: boolean }>) => {
  const { t } = useTranslation();
  const {
    router: { useParams, Routes, Route, Navigate },
  } = useAppContext();
  const { deviceId } = useParams() as { deviceId: string };
  const [device, loading, error, refetch] = useFetchPeriodically<Required<Device>>({ endpoint: `devices/${deviceId}` });
  const [showDebugInfo, setShowDebugInfo] = React.useState<boolean>(false);

  const navigate = useNavigate();
  const { post } = useFetch();

  const deviceAlias = device?.metadata.labels?.alias || deviceId;

  const { decommissionAction, decommissionModal } = useDecommissionAction({
    onConfirm: async (target: DeviceDecommission.decommissionTarget) => {
      const result = await post<DeviceDecommission>(`devices/${deviceId}/decommission`, {
        decommissionTarget: target,
      });

      refetch();
    },
    disabledReason: getDecommissionDisabledReason(device, t),
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
            <NavItem to="terminal">{t('Terminal')}</NavItem>
          </NavList>
        </Nav>
      }
      actions={
        <DetailsPageActions>
          <DropdownList>
            <DropdownItem
              onClick={() => navigate({ route: ROUTE.DEVICE_EDIT, postfix: deviceId })}
              {...editActionProps}
            >
              {t('Edit device configurations')}
            </DropdownItem>
            {decommissionAction}
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
              <DeviceDetailsTab device={device} refetch={refetch}>
                {children}
              </DeviceDetailsTab>
            }
          />
          {!hideTerminal && <Route path="terminal" element={<TerminalTab device={device} />} />}
        </Routes>
      )}
      {decommissionModal}
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
