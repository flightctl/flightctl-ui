import * as React from 'react';
import { Trans } from 'react-i18next';
import { Button, DropdownItem, DropdownList, Nav, NavList } from '@patternfly/react-core';

import {
  Device,
  DeviceDecommission,
  DeviceDecommissionTargetType,
  DeviceSummaryStatusType,
  ResourceKind,
} from '@flightctl/types';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { useFetch } from '../../../hooks/useFetch';
import { getDisabledTooltipProps } from '../../../utils/tooltip';
import DetailsPage from '../../DetailsPage/DetailsPage';
import DetailsPageActions, {
  useDecommissionAction,
  useDeleteAction,
  useResumeAction,
} from '../../DetailsPage/DetailsPageActions';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import { useAppContext } from '../../../hooks/useAppContext';
import DeviceDetailsTab from './DeviceDetailsTab';
import TerminalTab from './TerminalTab';
import NavItem from '../../NavItem/NavItem';
import { getEditDisabledReason, getResumeDisabledReason, isDeviceEnrolled } from '../../../utils/devices';
import { RESOURCE, VERB } from '../../../types/rbac';
import { useAccessReview } from '../../../hooks/useAccessReview';
import EventsCard from '../../Events/EventsCard';
import PageWithPermissions from '../../common/PageWithPermissions';
import YamlEditor from '../../common/CodeEditor/YamlEditor';
import DeviceAliasEdit from './DeviceAliasEdit';
import { SystemRestoreBanners } from '../../SystemRestore/SystemRestoreBanners';

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

  const deviceLabels = device?.metadata.labels;
  const deviceAlias = deviceLabels?.alias;
  const deviceNameOrAlias = deviceAlias || deviceId;
  const isEnrolled = !device || isDeviceEnrolled(device);

  const [hasTerminalAccess] = useAccessReview(RESOURCE.DEVICE_CONSOLE, VERB.GET);
  const [canDelete] = useAccessReview(RESOURCE.DEVICE, VERB.DELETE);
  const [canEdit] = useAccessReview(RESOURCE.DEVICE, VERB.PATCH);
  const [canDecommission] = useAccessReview(RESOURCE.DEVICE_DECOMMISSION, VERB.UPDATE);
  const [canResume] = useAccessReview(RESOURCE.DEVICE_RESUME, VERB.UPDATE);

  const canOpenTerminal = hasTerminalAccess && isEnrolled;

  const { deleteAction, deleteModal } = useDeleteAction({
    onDelete: async () => {
      await remove(`devices/${deviceId}`);
      navigate(ROUTE.DEVICES);
    },
    resourceName: deviceNameOrAlias,
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

  const { resumeAction, resumeModal } = useResumeAction({
    deviceId,
    alias: deviceAlias,
    disabledReason: device ? getResumeDisabledReason(device, t) : undefined,
    onResumeComplete: refetch,
  });

  const editDisabledReason = device ? getEditDisabledReason(device, t) : undefined;
  const editActionProps = device ? getDisabledTooltipProps(editDisabledReason) : undefined;
  const resumeDevice = {
    actionText: t('Resume device'),
    title: (
      <Trans t={t}>
        You are about to resume <strong>{deviceNameOrAlias}</strong>
      </Trans>
    ),
    requestSelector: {
      fieldSelector: `metadata.name=${deviceId}`,
    },
  };

  const deviceSummaryStatus = device?.status?.summary.status;
  const deviceSummary = {
    [DeviceSummaryStatusType.DeviceSummaryStatusConflictPaused]:
      deviceSummaryStatus === DeviceSummaryStatusType.DeviceSummaryStatusConflictPaused ? 1 : 0,
    [DeviceSummaryStatusType.DeviceSummaryStatusAwaitingReconnect]:
      deviceSummaryStatus === DeviceSummaryStatusType.DeviceSummaryStatusAwaitingReconnect ? 1 : 0,
  };

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
      banner={
        device && (
          <SystemRestoreBanners
            mode="device"
            resumeAction={resumeDevice}
            summaryStatus={deviceSummary}
            onResumeComplete={refetch}
            className="pf-v5-u-pt-0 pf-v5-u-px-lg"
          />
        )
      }
      resourceLink={ROUTE.DEVICES}
      resourceType="Devices"
      resourceTypeLabel={t('Devices')}
      nav={
        <Nav variant="tertiary">
          <NavList>
            <NavItem to="details">{t('Details')}</NavItem>
            <NavItem to="yaml">{t('YAML')}</NavItem>
            {!hideTerminal && canOpenTerminal && <NavItem to="terminal">{t('Terminal')}</NavItem>}
            <NavItem to="events">{t('Events')}</NavItem>
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
              {canResume && resumeAction}
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
          <Route
            path="yaml"
            element={<YamlEditor apiObj={device} refetch={refetch} disabledEditReason={editDisabledReason} />}
          />
          {!hideTerminal && canOpenTerminal && <Route path="terminal" element={<TerminalTab device={device} />} />}
          <Route path="events" element={<EventsCard kind={ResourceKind.DEVICE} objId={deviceId} />} />
        </Routes>
      )}

      {deleteModal || decommissionModal || resumeModal}
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
