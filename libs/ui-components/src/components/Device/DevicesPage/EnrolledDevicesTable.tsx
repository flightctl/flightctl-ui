import * as React from 'react';
import { Button, Switch, ToolbarItem } from '@patternfly/react-core';
import { Tbody } from '@patternfly/react-table';
import { TFunction } from 'react-i18next';

import { Device, DeviceDecommission, DeviceDecommissionTargetType, DeviceList } from '@flightctl/types';

import { FilterStatusMap } from './types';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { PaginationDetails } from '../../../hooks/useTablePagination';
import { useTranslation } from '../../../hooks/useTranslation';
import { useTableSelect } from '../../../hooks/useTableSelect';
import { useAccessReview } from '../../../hooks/useAccessReview';
import { useFetch } from '../../../hooks/useFetch';
import { RESOURCE, VERB } from '../../../types/rbac';
import {
  getApplicationStatusHelperText,
  getDeviceStatusHelperText,
  getUpdateStatusHelperText,
} from '../../Status/utils';

import Table, { ApiSortTableColumn } from '../../Table/Table';
import { useDecommissionListAction, useResumeListAction } from '../../ListPage/ListPageActions';
import TablePagination from '../../Table/TablePagination';
import MassDecommissionDeviceModal from '../../modals/massModals/MassDecommissionDeviceModal/MassDecommissionDeviceModal';
import AddDeviceModal from '../AddDeviceModal/AddDeviceModal';
import { EnrolledDevicesEmptyState } from './DevicesEmptyStates';
import DeviceTableToolbar from './DeviceTableToolbar';
import EnrolledDeviceTableRow from './EnrolledDeviceTableRow';
import { FilterSearchParams } from '../../../utils/status/devices';
import { GlobalSystemRestoreBanners } from '../../SystemRestore/SystemRestoreBanners';

interface EnrolledDeviceTableProps {
  devices: Array<Device>;
  ownerFleets: string[];
  activeStatuses: FilterStatusMap;
  hasFiltersEnabled: boolean;
  nameOrAlias: string | undefined;
  setOnlyDecommissioned: (check: boolean) => void;
  setNameOrAlias: (text: string) => void;
  setOwnerFleets: (ownerFleets: string[]) => void;
  setActiveStatuses: (activeStatuses: FilterStatusMap) => void;
  selectedLabels: FlightCtlLabel[];
  setSelectedLabels: (labels: FlightCtlLabel[]) => void;
  isFilterUpdating: boolean;
  pagination: Pick<PaginationDetails<DeviceList>, 'currentPage' | 'setCurrentPage' | 'itemCount'>;
  refetchDevices: VoidFunction;
  // getSortParams: (columnIndex: number) => ThProps['sort'];
}

const getDeviceColumns = (t: TFunction): ApiSortTableColumn[] => [
  {
    name: t('Alias'),
  },
  {
    name: t('Name'),
  },
  {
    name: t('Fleet'),
  },
  {
    name: t('Application status'),
    helperText: getApplicationStatusHelperText(t),
  },
  {
    name: t('Device status'),
    helperText: getDeviceStatusHelperText(t),
  },
  {
    name: t('Update status'),
    helperText: getUpdateStatusHelperText(t),
  },
];

const enrolledDevicesPermissions = [
  { kind: RESOURCE.DEVICE, verb: VERB.PATCH },
  { kind: RESOURCE.DEVICE_DECOMMISSION, verb: VERB.UPDATE },
  { kind: RESOURCE.DEVICE_RESUME, verb: VERB.UPDATE },
];

const EnrolledDevicesTable = ({
  devices,
  nameOrAlias,
  setNameOrAlias,
  ownerFleets,
  setOwnerFleets,
  activeStatuses,
  setActiveStatuses,
  setOnlyDecommissioned,
  selectedLabels,
  setSelectedLabels,
  hasFiltersEnabled,
  isFilterUpdating,
  pagination,
  refetchDevices,
}: EnrolledDeviceTableProps) => {
  const { t } = useTranslation();
  const { put } = useFetch();

  const [addDeviceModal, setAddDeviceModal] = React.useState(false);
  const [isMassDecommissionModalOpen, setIsMassDecommissionModalOpen] = React.useState(false);
  const deviceColumns = React.useMemo(() => getDeviceColumns(t), [t]);

  const { onRowSelect, hasSelectedRows, isAllSelected, isRowSelected, setAllSelected } = useTableSelect();

  const { action: resumeDeviceAction, modal: resumeDeviceModal } = useResumeListAction(refetchDevices);
  const { action: decommissionDeviceAction, modal: decommissionDeviceModal } = useDecommissionListAction({
    resourceType: 'Device',
    onConfirm: async (deviceId: string, params) => {
      await put<DeviceDecommission>(`devices/${deviceId}/decommission`, {
        target: params?.target || DeviceDecommissionTargetType.DeviceDecommissionTargetTypeUnenroll,
      });
      setOnlyDecommissioned(true);
    },
  });

  const [permissions] = useAccessReview(enrolledDevicesPermissions);
  const [canEdit = false, canDecommission = false, canResume = false] = permissions;

  const clearAllFilters = () => {
    if (hasFiltersEnabled) {
      setActiveStatuses({
        [FilterSearchParams.AppStatus]: [],
        [FilterSearchParams.DeviceStatus]: [],
        [FilterSearchParams.UpdatedStatus]: [],
      });
      setOwnerFleets([]);
      setNameOrAlias('');
      setSelectedLabels([]);
    }
  };

  return (
    <>
      <GlobalSystemRestoreBanners onResumeComplete={refetchDevices} />

      <DeviceTableToolbar
        nameOrAlias={nameOrAlias}
        setNameOrAlias={setNameOrAlias}
        ownerFleets={ownerFleets}
        setOwnerFleets={setOwnerFleets}
        activeStatuses={activeStatuses}
        setActiveStatuses={setActiveStatuses}
        selectedLabels={selectedLabels}
        setSelectedLabels={setSelectedLabels}
        isFilterUpdating={isFilterUpdating}
      >
        <ToolbarItem>
          <Button aria-label={t('Add devices')} onClick={() => setAddDeviceModal(true)}>
            {t('Add devices')}
          </Button>
        </ToolbarItem>
        {canDecommission && (
          <ToolbarItem>
            <Button
              isDisabled={!hasSelectedRows}
              onClick={() => setIsMassDecommissionModalOpen(true)}
              variant="secondary"
            >
              {t('Decommission devices')}
            </Button>
          </ToolbarItem>
        )}
        <ToolbarItem alignSelf="center">
          <Switch
            id="enrolled-devices-switch"
            label={<span className="fctl-switch__label">{t('Show decommissioned devices')}</span>}
            isChecked={false}
            onChange={() => {
              clearAllFilters();
              setOnlyDecommissioned(true);
            }}
            ouiaId={t('Show decommissioned devices')}
          />
        </ToolbarItem>
      </DeviceTableToolbar>
      <Table
        aria-label={t('Enrolled devices table')}
        loading={isFilterUpdating}
        columns={deviceColumns}
        hasFilters={hasFiltersEnabled}
        clearFilters={clearAllFilters}
        emptyData={devices.length === 0}
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
      >
        <Tbody>
          {devices.map((device, index) => (
            <EnrolledDeviceTableRow
              key={device.metadata.name || ''}
              device={device}
              onRowSelect={onRowSelect}
              isRowSelected={isRowSelected}
              rowIndex={index}
              canEdit={canEdit}
              canDecommission={canDecommission}
              decommissionAction={decommissionDeviceAction}
              canResume={canResume}
              resumeAction={resumeDeviceAction}
            />
          ))}
        </Tbody>
      </Table>
      <TablePagination isUpdating={isFilterUpdating} pagination={pagination} />
      {!hasFiltersEnabled && devices.length === 0 && (
        <EnrolledDevicesEmptyState onAddDevice={() => setAddDeviceModal(true)} />
      )}
      {decommissionDeviceModal || resumeDeviceModal}
      {addDeviceModal && <AddDeviceModal onClose={() => setAddDeviceModal(false)} />}
      {isMassDecommissionModalOpen && (
        <MassDecommissionDeviceModal
          onClose={() => setIsMassDecommissionModalOpen(false)}
          devices={devices.filter(isRowSelected)}
          onSuccess={() => {
            setIsMassDecommissionModalOpen(false);
            setOnlyDecommissioned(true);
          }}
        />
      )}
    </>
  );
};

export default EnrolledDevicesTable;
