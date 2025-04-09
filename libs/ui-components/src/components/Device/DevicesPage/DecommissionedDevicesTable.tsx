import * as React from 'react';
import { Button, Switch, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { Tbody } from '@patternfly/react-table';
import { TFunction } from 'react-i18next';

import { Device, DeviceList } from '@flightctl/types';

import { PaginationDetails } from '../../../hooks/useTablePagination';
import { useTranslation } from '../../../hooks/useTranslation';
import { useTableSelect } from '../../../hooks/useTableSelect';
import { useAccessReview } from '../../../hooks/useAccessReview';
import { useFetch } from '../../../hooks/useFetch';
import { RESOURCE, VERB } from '../../../types/rbac';

import Table, { ApiSortTableColumn } from '../../Table/Table';
import { useDeleteListAction } from '../../ListPage/ListPageActions';
import TablePagination from '../../Table/TablePagination';
import MassDeleteDeviceModal from '../../modals/massModals/MassDeleteDeviceModal/MassDeleteDeviceModal';
import AddDeviceModal from '../AddDeviceModal/AddDeviceModal';
import { DecommissionedDevicesEmptyState } from './DevicesEmptyStates';
import DecommissionedDeviceTableRow from './DecommissionedDeviceTableRow';
import DeviceNameOnlyToolbarFilter from './DeviceNameOnlyToolbarFilter';

interface DecommissionedDevicesTableProps {
  devices: Array<Device>;
  refetch: VoidFunction;
  nameOrAlias: string | undefined;
  setOnlyDecommissioned: (check: boolean) => void;
  setNameOrAlias: (text: string) => void;
  hasFiltersEnabled: boolean;
  isFilterUpdating: boolean;
  pagination: Pick<PaginationDetails<DeviceList>, 'currentPage' | 'setCurrentPage' | 'itemCount'>;
}

const getDeviceColumns = (t: TFunction): ApiSortTableColumn[] => [
  {
    name: t('Name'),
  },
  {
    name: t('Status'),
  },
  {
    name: t('Last seen'),
  },
];

const DecommissionedDevicesTable = ({
  devices,
  refetch,
  nameOrAlias,
  setNameOrAlias,
  hasFiltersEnabled,
  setOnlyDecommissioned,
  isFilterUpdating,
  pagination,
}: DecommissionedDevicesTableProps) => {
  const { t } = useTranslation();
  const [addDeviceModal, setAddDeviceModal] = React.useState(false);
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);
  const { remove } = useFetch();
  const deviceColumns = React.useMemo(() => getDeviceColumns(t), [t]);

  const { onRowSelect, hasSelectedRows, isAllSelected, isRowSelected, setAllSelected } = useTableSelect();

  const { action: deleteDeviceAction, modal: deleteDeviceModal } = useDeleteListAction({
    resourceType: 'Device',
    onConfirm: async (resourceId: string) => {
      await remove(`devices/${resourceId}`);
      refetch();
    },
  });

  const [canDelete] = useAccessReview(RESOURCE.DEVICE, VERB.DELETE);
  const [canEdit] = useAccessReview(RESOURCE.DEVICE, VERB.PATCH);

  return (
    <>
      <Toolbar id="decommissioned-devices-toolbar" inset={{ default: 'insetNone' }}>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem variant="search-filter">
              <DeviceNameOnlyToolbarFilter nameOrAlias={nameOrAlias} setNameOrAlias={setNameOrAlias} />
            </ToolbarItem>
            <ToolbarItem>
              <Button aria-label={t('Add devices')} onClick={() => setAddDeviceModal(true)}>
                {t('Add devices')}
              </Button>
            </ToolbarItem>
            {canDelete && (
              <ToolbarItem>
                <Button
                  isDisabled={!hasSelectedRows}
                  onClick={() => setIsMassDeleteModalOpen(true)}
                  variant="secondary"
                >
                  {t('Delete forever')}
                </Button>
              </ToolbarItem>
            )}
            <ToolbarItem alignSelf="center">
              <Switch
                id="decommissioned-devices-switch"
                label={t('Show only decommissioned devices')}
                isChecked
                onChange={() => {
                  setOnlyDecommissioned(false);
                }}
                ouiaId={t('Show only decommissioned devices')}
              />
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>
      <Table
        aria-label={t('Devices table')}
        loading={isFilterUpdating}
        columns={deviceColumns}
        hasFilters={hasFiltersEnabled}
        clearFilters={() => setNameOrAlias('')}
        emptyData={devices.length === 0}
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
      >
        <Tbody>
          {devices.map((device, index) => (
            <DecommissionedDeviceTableRow
              key={device.metadata.name || ''}
              device={device}
              deleteAction={deleteDeviceAction}
              onRowSelect={onRowSelect}
              isRowSelected={isRowSelected}
              rowIndex={index}
              canDelete={canDelete}
              canEdit={canEdit}
            />
          ))}
        </Tbody>
      </Table>
      <TablePagination isUpdating={isFilterUpdating} pagination={pagination} />
      {!hasFiltersEnabled && devices.length === 0 && <DecommissionedDevicesEmptyState />}
      {deleteDeviceModal}
      {addDeviceModal && <AddDeviceModal onClose={() => setAddDeviceModal(false)} />}
      {isMassDeleteModalOpen && (
        <MassDeleteDeviceModal
          onClose={() => setIsMassDeleteModalOpen(false)}
          resources={devices.filter(isRowSelected)}
          onDeleteSuccess={() => {
            setIsMassDeleteModalOpen(false);
            refetch();
          }}
        />
      )}
    </>
  );
};

export default DecommissionedDevicesTable;
