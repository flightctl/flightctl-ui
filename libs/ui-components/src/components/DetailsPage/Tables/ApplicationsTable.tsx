import * as React from 'react';
import { Alert, Bullseye, Button, Label, Popover, Stack, StackItem, Title } from '@patternfly/react-core';
import { ExpandableRowContent, Table, Tbody, Td, Th, Tr } from '@patternfly/react-table';

import {
  ApplicationDesiredState,
  type ApplicationProviderSpec,
  ApplicationStatusType,
  type DeviceApplicationStatus,
} from '@flightctl/types';
import { useApplicationLifecycle } from '../../../hooks/useApplicationLifecycle';
import { useRestartSpikes } from '../../../hooks/useRestartSpikes';
import { useTranslation } from '../../../hooks/useTranslation';
import { getAppTypeLabel } from '../../../utils/apps';
import {
  type DeviceAppLifecycleOverrides,
  hasAplicationStatusMismatch,
  transitionalStatuses,
} from '../../../utils/applicationLifecycle';
import { type StatusAppWithSpec, getAppsByType } from '../../../utils/vmApplications';
import { isVmAppSpec } from '../../../types/deviceSpec';
import { RESOURCE, VERB } from '../../../types/rbac';
import { usePermissionsContext } from '../../common/PermissionsContext';
import ApplicationStatus from '../../Status/ApplicationStatus';
import VmAppExpandedDetails from '../../Device/DeviceDetails/VmAppExpandedDetails';
import WorkloadAppExpandedDetails from '../../Device/DeviceDetails/WorkloadAppExpandedDetails';
import ApplicationLifecycleActions from './ApplicationLifecycleActions';

import './ApplicationsTable.css';

// Common types both for all Applications as well as for a single Application
type BaseApplicationsTableProps = {
  deviceName: string;
  lifecycleDisabledReason?: string;
  refetch: VoidFunction;
  onOpenConsole?: (name: string) => void;
};

const applicationActionsPermissions = [
  { kind: RESOURCE.DEVICE_APPLICATION_LIFECYCLE, verb: VERB.UPDATE },
  { kind: RESOURCE.DEVICE_APPLICATION_CONSOLE, verb: VERB.GET },
];

const COL_COUNT = 6;

const ApplicationsTableHeaderRows = () => {
  const { t } = useTranslation();

  return (
    <Tbody className="fctl-applications-table__column-headers">
      <Tr>
        <Th screenReaderText={t('Expand row')} />
        <Th>{t('Name')}</Th>
        <Th modifier="wrap">{t('Status')}</Th>
        <Th modifier="wrap">{t('Type')}</Th>
        <Th modifier="wrap">{t('Ready')}</Th>
        <Th modifier="wrap">{t('Restarts')}</Th>
      </Tr>
    </Tbody>
  );
};

const ApplicationSectionHeaderRow = ({ type }: { type: 'workload' | 'vm' }) => {
  const { t } = useTranslation();
  return (
    <Tbody>
      <Tr>
        <Td colSpan={COL_COUNT} className="fctl-applications-table__section-header">
          <Title headingLevel="h4" size="md" className="pf-v6-u-mt-md">
            {type === 'workload' ? t('Workload applications') : t('Virtual machines')}
          </Title>
        </Td>
      </Tr>
    </Tbody>
  );
};

const AppExpandedDetails = ({
  application,
  desiredState,
}: {
  application: StatusAppWithSpec;
  desiredState?: ApplicationDesiredState;
}) => {
  const appSpec = application.spec;
  if (appSpec && isVmAppSpec(appSpec)) {
    return <VmAppExpandedDetails vmSpec={appSpec} vmName={application.status.name} desiredState={desiredState} />;
  }
  return <WorkloadAppExpandedDetails application={application} desiredState={desiredState} />;
};

type RestartLoopStopButtonProps = {
  onStop: () => void;
  isDisabled: boolean;
  isLoading: boolean;
};

const RestartLoopStopButton = ({ onStop, isDisabled, isLoading }: RestartLoopStopButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button variant="secondary" onClick={onStop} isDisabled={isDisabled} isLoading={isLoading}>
      {t('Stop application')}
    </Button>
  );
};

type RestartLoopWarningProps = {
  restartDelta: number;
  canStop: boolean;
  stopDisabled: boolean;
  stopLoading: boolean;
  onStop: () => void;
};

const AppRestartsWarning = ({
  restarts,
  restartDelta,
  canStop,
  stopDisabled,
  stopLoading,
  onStop,
}: RestartLoopWarningProps & { restarts: number }) => {
  const { t } = useTranslation();
  return (
    <Popover
      aria-label={t('Restart loop detected')}
      headerContent={t('Restart loop detected')}
      bodyContent={
        <Stack hasGutter>
          <StackItem>
            {t(
              'This application has restarted {{ count }} times this session. Stop the application to prevent further restarts and investigate the issue.',
              {
                count: restartDelta,
              },
            )}
          </StackItem>

          {canStop && (
            <StackItem>
              <RestartLoopStopButton onStop={onStop} isDisabled={stopDisabled} isLoading={stopLoading} />
            </StackItem>
          )}
        </Stack>
      }
      withFocusTrap={false}
    >
      <Button aria-label={t('Restart loop detected')} variant="link" isInline>
        <Label status="warning" variant="outline">
          {restarts}
        </Label>
      </Button>
    </Popover>
  );
};

const RestartLoopAlert = ({ restartDelta, canStop, stopDisabled, stopLoading, onStop }: RestartLoopWarningProps) => {
  const { t } = useTranslation();
  return (
    <Alert isInline variant="warning" title={t('This application is restarting repeatedly')}>
      <Stack hasGutter>
        <StackItem>
          {t(
            'The application has restarted {{ count }} times this session and may be misconfigured. Stop the application to prevent further restarts and investigate the issue.',
            {
              count: restartDelta,
            },
          )}
        </StackItem>
        {canStop && (
          <StackItem>
            <RestartLoopStopButton onStop={onStop} isDisabled={stopDisabled} isLoading={stopLoading} />
          </StackItem>
        )}
      </Stack>
    </Alert>
  );
};

type ApplicationTableRowProps = BaseApplicationsTableProps & {
  desiredState?: ApplicationDesiredState;
  application: StatusAppWithSpec;
  rowIndex: number;
  isExpanded: boolean;
  onToggle: VoidFunction;
  canManageLifecycle: boolean;
  restartDelta?: number;
};

const ApplicationTableRow = ({
  deviceName,
  refetch,
  lifecycleDisabledReason,
  desiredState,
  application,
  rowIndex,
  isExpanded,
  onToggle,
  canManageLifecycle,
  onOpenConsole,
  restartDelta,
}: ApplicationTableRowProps) => {
  const { t } = useTranslation();
  const { status: appStatusObj } = application;
  const appStatus = appStatusObj.status;

  const lifecycle = useApplicationLifecycle({
    deviceName,
    appName: appStatusObj.name,
    appStatus,
    appRestarts: appStatusObj.restarts,
    refetch,
  });

  const isTransitioning = transitionalStatuses.includes(appStatus);
  const hasStatusMismatch = hasAplicationStatusMismatch(appStatus, desiredState);
  const isUserInitiatedTransition = lifecycle.pendingAction != null;
  const isExternallyTransitioning = isTransitioning && !isUserInitiatedTransition && !hasStatusMismatch;
  const isStopDisabled =
    !!lifecycleDisabledReason ||
    lifecycle.isSubmitting ||
    isUserInitiatedTransition ||
    hasStatusMismatch ||
    isExternallyTransitioning;
  const isStopRequested =
    lifecycle.pendingAction === 'stop' || desiredState === ApplicationDesiredState.ApplicationDesiredStateStopped;
  const isStoppedOrStopping =
    appStatus === ApplicationStatusType.ApplicationStatusStopping ||
    appStatus === ApplicationStatusType.ApplicationStatusStopped;
  const showRestartLoopWarning = !!restartDelta && !isStopRequested && !isStoppedOrStopping;
  const canStop = canManageLifecycle && !isStopRequested;
  const onStop = () => {
    void lifecycle.stop();
  };

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr>
        <Td
          expand={{
            rowIndex,
            isExpanded,
            onToggle,
          }}
        />
        <Td dataLabel={t('Name')}>{appStatusObj.name}</Td>
        <Td dataLabel={t('Status')}>
          <ApplicationStatus status={appStatusObj.status} desiredState={desiredState} />
        </Td>
        <Td dataLabel={t('Type')}>
          <Label variant="outline" isCompact>
            {getAppTypeLabel(appStatusObj.appType, t)}
          </Label>
        </Td>
        <Td dataLabel={t('Ready')}>{appStatusObj.ready}</Td>
        <Td dataLabel={t('Restarts')}>
          {showRestartLoopWarning ? (
            <AppRestartsWarning
              restarts={appStatusObj.restarts}
              restartDelta={restartDelta}
              canStop={canStop}
              stopDisabled={isStopDisabled}
              stopLoading={lifecycle.isSubmitting}
              onStop={onStop}
            />
          ) : (
            appStatusObj.restarts
          )}
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td colSpan={COL_COUNT}>
          <ExpandableRowContent>
            <Stack hasGutter>
              <StackItem>
                <ApplicationLifecycleActions
                  lifecycleDisabledReason={lifecycleDisabledReason}
                  desiredState={desiredState}
                  appStatus={application.status}
                  canManageLifecycle={canManageLifecycle}
                  lifecycle={lifecycle}
                  onOpenConsole={onOpenConsole}
                />
              </StackItem>
              {showRestartLoopWarning && isExpanded && (
                <StackItem>
                  <RestartLoopAlert
                    restartDelta={restartDelta}
                    canStop={canStop}
                    stopDisabled={isStopDisabled}
                    stopLoading={lifecycle.isSubmitting}
                    onStop={onStop}
                  />
                </StackItem>
              )}
              <StackItem>
                <AppExpandedDetails application={application} desiredState={desiredState} />
              </StackItem>
            </Stack>
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};

type ApplicationsTableProps = BaseApplicationsTableProps & {
  deviceAppLifecycleOverrides: DeviceAppLifecycleOverrides;
  appsStatus?: DeviceApplicationStatus[];
  appsSpecs?: ApplicationProviderSpec[];
};

const ApplicationsTable = ({
  deviceName,
  refetch,
  lifecycleDisabledReason,
  deviceAppLifecycleOverrides,
  appsStatus = [],
  appsSpecs = [],
  onOpenConsole,
}: ApplicationsTableProps) => {
  const { t } = useTranslation();
  const { checkPermissions } = usePermissionsContext();
  const [canManageLifecycle, canOpenConsole] = checkPermissions(applicationActionsPermissions);
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null);

  const { workloadApps, vmApps } = React.useMemo(() => getAppsByType(appsStatus, appsSpecs), [appsStatus, appsSpecs]);
  const restartDeltas = useRestartSpikes(appsStatus);

  if (workloadApps.length === 0 && vmApps.length === 0) {
    return <Bullseye>{t('No applications found')}</Bullseye>;
  }

  const renderSection = (type: 'workload' | 'vm', applications: StatusAppWithSpec[], rowIndexOffset: number) => (
    <>
      <ApplicationSectionHeaderRow type={type} />
      <ApplicationsTableHeaderRows />

      {applications.map((application, index) => {
        const { name } = application.status;
        const rowKey = `${type}-${name}`;

        return (
          <ApplicationTableRow
            key={rowKey}
            deviceName={deviceName}
            refetch={refetch}
            lifecycleDisabledReason={lifecycleDisabledReason}
            desiredState={deviceAppLifecycleOverrides[name]}
            application={application}
            rowIndex={rowIndexOffset + index}
            isExpanded={expandedRow === rowKey}
            onToggle={() => setExpandedRow(expandedRow === rowKey ? null : rowKey)}
            canManageLifecycle={canManageLifecycle}
            onOpenConsole={canOpenConsole ? onOpenConsole : undefined}
            restartDelta={restartDeltas[name]}
          />
        );
      })}
    </>
  );

  return (
    <Table
      aria-label={t('Applications')}
      variant="compact"
      isExpandable
      id="fctl-applications-table"
      className="pf-v6-u-p-0"
    >
      {workloadApps.length > 0 && renderSection('workload', workloadApps, 0)}
      {vmApps.length > 0 && renderSection('vm', vmApps, workloadApps.length)}
    </Table>
  );
};

export default ApplicationsTable;
