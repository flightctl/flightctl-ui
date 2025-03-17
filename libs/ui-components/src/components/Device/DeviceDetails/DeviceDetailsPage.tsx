import * as React from 'react';
import { Button, DropdownItem, DropdownList, Nav, NavList } from '@patternfly/react-core';

import { Device, DeviceDecommission, DeviceDecommissionTargetType } from '@flightctl/types';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { useFetch } from '../../../hooks/useFetch';
import { getDisabledTooltipProps } from '../../../utils/tooltip';
import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageActions, { useDecommissionAction, useDeleteAction } from '../../DetailsPage/DetailsPageActions';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';
import DeviceDetailsTab from './DeviceDetailsTab';
import TerminalTab from './TerminalTab';
import NavItem from '../../NavItem/NavItem';
import DeviceStatusDebugModal from './DeviceStatusDebugModal';
import { getEditDisabledReason, isDeviceEnrolled } from '../../../utils/devices';
import { RESOURCE, VERB } from '../../../types/rbac';
import { useAccessReview } from '../../../hooks/useAccessReview';
import PageWithPermissions from '../../common/PageWithPermissions';
import DeviceAliasEdit from './DeviceAliasEdit';

type DeviceDetailsPageProps = React.PropsWithChildren<{ hideTerminal?: boolean }>;

const DeviceDetailsPage = ({ children, hideTerminal }: DeviceDetailsPageProps) => {
  const { t } = useTranslation();
  const {
    router: { useParams, Routes, Route, Navigate },
  } = useAppContext();
  const { deviceId } = useParams() as { deviceId: string };
  const navigate = useNavigate();
  const { put, remove } = useFetch();
  const [device, loading, error, refetch] = useFetchPeriodically<Required<Device>>({ endpoint: `devices/${deviceId}` });

  const [showDebugInfo, setShowDebugInfo] = React.useState<boolean>(false);

  const deviceLabels = device?.metadata.labels;
  const deviceAlias = deviceLabels?.alias;
  const isEnrolled = !device || isDeviceEnrolled(device);

  const [hasTerminalAccess] = useAccessReview(RESOURCE.DEVICE_CONSOLE, VERB.GET);
  const [canDelete] = useAccessReview(RESOURCE.DEVICE, VERB.DELETE);
  const [canEdit] = useAccessReview(RESOURCE.DEVICE, VERB.PATCH);
  const [canDecommission] = useAccessReview(RESOURCE.DEVICE_DECOMMISSION, VERB.UPDATE);

  const canOpenTerminal = hasTerminalAccess && isEnrolled;

  const { deleteAction, deleteModal } = useDeleteAction({
    onDelete: async () => {
      await remove(`devices/${deviceId}`);
      navigate(ROUTE.DEVICES);
    },
    resourceName: deviceAlias || deviceId,
    resourceType: 'device',
    buttonLabel: isEnrolled ? undefined : t('Delete forever'),
  });

  const { decommissionAction, decommissionModal } = useDecommissionAction({
    onDecommission: async (target: DeviceDecommissionTargetType) => {
      await put<DeviceDecommission>(`devices/${deviceId}/decommission`, {
        target,
      });
      refetch();
      navigate(ROUTE.DEVICES);
    },
  });

  const editActionProps = device ? getDisabledTooltipProps(getEditDisabledReason(device, t)) : undefined;

  return (
    <DetailsPage
      loading={loading}
      error={error}
      id={deviceId}
      breadcrumbTitle={deviceAlias}
      title={
        canEdit ? (
          /* key={deviceAlias} is needed for the input field to be initialized with the alias as its value */
          <DeviceAliasEdit
            key={deviceAlias}
            deviceId={deviceId}
            alias={deviceAlias}
            hasLabels={!!deviceLabels}
            onAliasEdited={refetch}
          />
        ) : (
          deviceAlias
        )
      }
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
        isEnrolled ? (
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
              <DropdownItem
                onClick={() => {
                  setShowDebugInfo(!showDebugInfo);
                }}
              >
                {t('View status debug information')}
              </DropdownItem>
              {canDecommission && decommissionAction}
            </DropdownList>
          </DetailsPageActions>
        ) : (
          canDelete && (
            <Button component="a" aria-label={t('Delete device forever')} variant="danger" tabIndex={0}>
              {deleteAction}
            </Button>
          )
        )
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
