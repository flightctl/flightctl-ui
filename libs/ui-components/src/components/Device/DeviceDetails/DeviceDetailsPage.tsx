import * as React from 'react';
import { Trans } from 'react-i18next';
import { Button, DropdownItem, DropdownList, Tab } from '@patternfly/react-core';

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
import { getEditDisabledReason, getResumeDisabledReason, isDeviceEnrolled } from '../../../utils/devices';
import TabsNav from '../../TabsNav/TabsNav';
import { RESOURCE, VERB } from '../../../types/rbac';
import { usePermissionsContext } from '../../common/PermissionsContext';
import EventsCard from '../../Events/EventsCard';
import PageWithPermissions from '../../common/PageWithPermissions';
import YamlEditor from '../../common/CodeEditor/YamlEditor';
import DeviceAliasEdit from './DeviceAliasEdit';
import { SystemRestoreBanners } from '../../SystemRestore/SystemRestoreBanners';

type DeviceDetailsPageProps = React.PropsWithChildren<{ hideTerminal?: boolean }>;

const deviceDetailsPermissions = [
  { kind: RESOURCE.DEVICE_CONSOLE, verb: VERB.GET },
  { kind: RESOURCE.DEVICE, verb: VERB.DELETE },
  { kind: RESOURCE.DEVICE, verb: VERB.PATCH },
  { kind: RESOURCE.DEVICE_DECOMMISSION, verb: VERB.UPDATE },
  { kind: RESOURCE.DEVICE_RESUME, verb: VERB.UPDATE },
];

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

  const { checkPermissions } = usePermissionsContext();
  const [hasTerminalAccess, canDelete, hasEditPermissions, canDecommission, canResume] =
    checkPermissions(deviceDetailsPermissions);

  const canEdit = hasEditPermissions && isEnrolled;
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
            className="pf-v6-u-pt-0 pf-v6-u-px-lg"
          />
        )
      }
      resourceLink={ROUTE.DEVICES}
      resourceType="Devices"
      resourceTypeLabel={t('Devices')}
      nav={
        <TabsNav aria-label="Device details tabs" tabKeys={['details', 'yaml', 'terminal', 'events']}>
          <Tab eventKey="details" title={t('Details')} />
          <Tab eventKey="yaml" title={t('YAML')} />
          {!hideTerminal && canOpenTerminal && <Tab eventKey="terminal" title={t('Terminal')} />}
          <Tab eventKey="events" title={t('Events')} />
        </TabsNav>
      }
      actions={
        isEnrolled ? (
          <DetailsPageActions>
            <DropdownList>
              {hasEditPermissions && (
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
              <DeviceDetailsTab device={device} refetch={refetch} canEdit={hasEditPermissions}>
                {children}
              </DeviceDetailsTab>
            }
          />
          <Route
            path="yaml"
            element={
              <YamlEditor
                apiObj={device}
                refetch={refetch}
                disabledEditReason={editDisabledReason}
                canEdit={hasEditPermissions}
              />
            }
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
  const { checkPermissions, loading } = usePermissionsContext();
  const [allowed] = checkPermissions([{ kind: RESOURCE.DEVICE, verb: VERB.GET }]);
  return (
    <PageWithPermissions allowed={allowed} loading={loading}>
      <DeviceDetailsPage {...props} />
    </PageWithPermissions>
  );
};

export default DeviceDetailsPageWithPermissions;
