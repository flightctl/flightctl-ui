import * as React from 'react';
import { Bullseye, Label, Stack, StackItem, Title } from '@patternfly/react-core';
import { ExpandableRowContent, Table, Tbody, Td, Th, Tr } from '@patternfly/react-table';

import {
  type ApplicationDesiredState,
  type ApplicationProviderSpec,
  type DeviceApplicationStatus,
} from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { getAppTypeLabel } from '../../../utils/apps';
import { DeviceAppLifecycleOverrides } from '../../../utils/applicationLifecycle';
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

type ApplicationTableRowProps = BaseApplicationsTableProps & {
  desiredState?: ApplicationDesiredState;
  application: StatusAppWithSpec;
  rowIndex: number;
  isExpanded: boolean;
  onToggle: VoidFunction;
  canManageLifecycle: boolean;
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
}: ApplicationTableRowProps) => {
  const { t } = useTranslation();
  const { status: appStatusObj } = application;

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
        <Td dataLabel={t('Restarts')}>{appStatusObj.restarts}</Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td colSpan={COL_COUNT}>
          <ExpandableRowContent>
            <Stack hasGutter>
              <StackItem>
                <ApplicationLifecycleActions
                  deviceName={deviceName}
                  refetch={refetch}
                  lifecycleDisabledReason={lifecycleDisabledReason}
                  desiredState={desiredState}
                  appStatus={application.status}
                  canManageLifecycle={canManageLifecycle}
                  onOpenConsole={onOpenConsole}
                />
              </StackItem>
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
