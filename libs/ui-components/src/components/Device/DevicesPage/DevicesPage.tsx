import * as React from 'react';
import {
  Button,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  PageSection,
  PageSectionVariants,
  ToolbarItem,
} from '@patternfly/react-core';
import { Tbody } from '@patternfly/react-table';
import { MicrochipIcon } from '@patternfly/react-icons/dist/js/icons/microchip-icon';
import { Trans } from 'react-i18next';
import { TFunction } from 'i18next';

import { useFetch } from '../../../hooks/useFetch';
import { Device, Fleet, FleetList } from '@flightctl/types';

import ListPage from '../../ListPage/ListPage';
import ListPageBody from '../../ListPage/ListPageBody';
import { useDeleteListAction } from '../../ListPage/ListPageActions';
import AddDeviceModal from '../AddDeviceModal/AddDeviceModal';
import { sortByAlias, sortByLastSeenDate, sortByName } from '../../../utils/sort/generic';
import { sortDeviceStatus, sortDevicesByFleet } from '../../../utils/sort/device';
import Table, { TableColumn } from '../../Table/Table';
import DeviceTableToolbar from './DeviceTableToolbar';
import { useDeviceFilters } from './useDeviceFilters';
import DeviceTableRow from './DeviceTableRow';
import { FlightCtlLabel } from '../../../types/extraTypes';
import MassDeleteDeviceModal from '../../modals/massModals/MassDeleteDeviceModal/MassDeleteDeviceModal';
import ResourceListEmptyState from '../../common/ResourceListEmptyState';
import { useTableSort } from '../../../hooks/useTableSort';
import { useTableSelect } from '../../../hooks/useTableSelect';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link, ROUTE } from '../../../hooks/useNavigate';
import { useDevices } from './useDevices';
import { useDeviceBackendFilters } from './useDeviceBackendFilters';
import {
  getApplicationStatusHelperText,
  getDeviceStatusHelperText,
  getUpdateStatusHelperText,
} from '../../Status/utils';
import { FilterStatusMap } from './types';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import EnrollmentRequestList from './EnrollmentRequestList';

type DeviceEmptyStateProps = {
  onAddDevice: VoidFunction;
};

const DeviceEmptyState: React.FC<DeviceEmptyStateProps> = ({ onAddDevice }) => {
  const { t } = useTranslation();
  return (
    <ResourceListEmptyState icon={MicrochipIcon} titleText={t('No devices here!')}>
      <EmptyStateBody>
        <Trans t={t}>
          You can add devices and label them to match fleets, or your can{' '}
          <Link to={ROUTE.FLEET_CREATE}>start with a fleet</Link> and add devices into it.
        </Trans>
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button onClick={onAddDevice}>{t('Add devices')}</Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </ResourceListEmptyState>
  );
};

const getDeviceColumns = (t: TFunction): TableColumn<Device>[] => [
  {
    name: t('Alias'),
    onSort: sortByAlias,
  },
  {
    name: t('Name'),
    onSort: sortByName,
  },
  {
    name: t('Fleet'),
    onSort: sortDevicesByFleet,
  },
  {
    name: t('Application status'),
    helperText: getApplicationStatusHelperText(t),
    onSort: (devices: Array<Device>) => sortDeviceStatus(devices, 'ApplicationStatus'),
  },
  {
    name: t('Device status'),
    helperText: getDeviceStatusHelperText(t),
    onSort: (devices: Array<Device>) => sortDeviceStatus(devices, 'DeviceStatus'),
    defaultSort: true,
  },
  {
    name: t('Update status'),
    helperText: getUpdateStatusHelperText(t),
    onSort: (devices: Array<Device>) => sortDeviceStatus(devices, 'SystemUpdateStatus'),
  },
  {
    name: t('Last seen'),
    onSort: sortByLastSeenDate,
  },
];

interface DeviceTableProps {
  devices: Array<Device>;
  refetch: VoidFunction;
  ownerFleets: string[];
  activeStatuses: FilterStatusMap;
  hasFiltersEnabled: boolean;
  setOwnerFleets: (ownerFleets: string[]) => void;
  setActiveStatuses: (activeStatuses: FilterStatusMap) => void;
  selectedLabels: FlightCtlLabel[];
  setSelectedLabels: (labels: FlightCtlLabel[]) => void;
  fleets: Fleet[];
  isFilterUpdating: boolean;
}

export const DeviceTable = ({
  devices,
  refetch,
  ownerFleets,
  setOwnerFleets,
  activeStatuses,
  setActiveStatuses,
  selectedLabels,
  setSelectedLabels,
  hasFiltersEnabled,
  fleets,
  isFilterUpdating,
}: DeviceTableProps) => {
  const { t } = useTranslation();
  const [addDeviceModal, setAddDeviceModal] = React.useState(false);
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);
  const { remove } = useFetch();

  const deviceColumns = React.useMemo(() => getDeviceColumns(t), [t]);

  const { filteredData, hasFiltersEnabled: hasUIFiltersEnabled, ...rest } = useDeviceFilters(devices);
  const { getSortParams, sortedData } = useTableSort(filteredData, deviceColumns);

  const { onRowSelect, hasSelectedRows, isAllSelected, isRowSelected, setAllSelected } = useTableSelect();

  const { deleteAction: deleteDeviceAction, deleteModal: deleteDeviceModal } = useDeleteListAction({
    resourceType: 'Device',
    onDelete: async (resourceId: string) => {
      await remove(`devices/${resourceId}`);
      refetch();
    },
  });

  return (
    <>
      <DeviceTableToolbar
        {...rest}
        ownerFleets={ownerFleets}
        setOwnerFleets={setOwnerFleets}
        activeStatuses={activeStatuses}
        setActiveStatuses={setActiveStatuses}
        selectedLabels={selectedLabels}
        setSelectedLabels={setSelectedLabels}
        devices={devices}
        fleets={fleets}
        isFilterUpdating={isFilterUpdating}
      >
        <ToolbarItem>
          <Button onClick={() => setAddDeviceModal(true)}>{t('Add devices')}</Button>
        </ToolbarItem>
        <ToolbarItem>
          <Button isDisabled={!hasSelectedRows} onClick={() => setIsMassDeleteModalOpen(true)} variant="secondary">
            {t('Delete devices')}
          </Button>
        </ToolbarItem>
      </DeviceTableToolbar>
      <Table
        aria-label={t('Devices table')}
        columns={deviceColumns}
        emptyFilters={filteredData.length === 0 && (hasFiltersEnabled || hasUIFiltersEnabled)}
        emptyData={devices.length === 0}
        getSortParams={getSortParams}
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
      >
        <Tbody>
          {sortedData.map((device, index) => (
            <DeviceTableRow
              key={device.metadata.name || ''}
              device={device}
              deleteAction={deleteDeviceAction}
              onRowSelect={onRowSelect}
              isRowSelected={isRowSelected}
              rowIndex={index}
            />
          ))}
        </Tbody>
      </Table>
      {!hasFiltersEnabled && !hasUIFiltersEnabled && devices.length === 0 && (
        <DeviceEmptyState onAddDevice={() => setAddDeviceModal(true)} />
      )}
      {deleteDeviceModal}
      {addDeviceModal && <AddDeviceModal onClose={() => setAddDeviceModal(false)} />}
      {isMassDeleteModalOpen && (
        <MassDeleteDeviceModal
          onClose={() => setIsMassDeleteModalOpen(false)}
          resources={sortedData.filter(isRowSelected)}
          onDeleteSuccess={() => {
            setIsMassDeleteModalOpen(false);
            refetch();
          }}
        />
      )}
    </>
  );
};

const DevicesPage = () => {
  const { t } = useTranslation();
  const {
    ownerFleets,
    activeStatuses,
    hasFiltersEnabled,
    setOwnerFleets,
    setActiveStatuses,
    selectedLabels,
    setSelectedLabels,
  } = useDeviceBackendFilters();
  const [data, loading, error, updating, refetch] = useDevices({
    ownerFleets,
    activeStatuses,
    labels: selectedLabels,
  });

  const [fleetsList, flLoading, flError] = useFetchPeriodically<FleetList>({
    endpoint: 'fleets',
  });

  return (
    <PageSection variant={PageSectionVariants.light}>
      <EnrollmentRequestList refetchDevices={refetch} />

      <ListPage title={t('Devices')}>
        <ListPageBody error={error || flError} loading={loading || flLoading}>
          <DeviceTable
            devices={data}
            refetch={refetch}
            hasFiltersEnabled={hasFiltersEnabled || updating}
            ownerFleets={ownerFleets}
            activeStatuses={activeStatuses}
            setOwnerFleets={setOwnerFleets}
            setActiveStatuses={setActiveStatuses}
            selectedLabels={selectedLabels}
            setSelectedLabels={setSelectedLabels}
            fleets={fleetsList?.items || []}
            isFilterUpdating={updating}
          />
        </ListPageBody>
      </ListPage>
    </PageSection>
  );
};

export default DevicesPage;
