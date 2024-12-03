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
import Table, { ApiSortTableColumn } from '../../Table/Table';
import DeviceTableToolbar from './DeviceTableToolbar';
import DeviceTableRow from './DeviceTableRow';
import { FlightCtlLabel } from '../../../types/extraTypes';
import MassDeleteDeviceModal from '../../modals/massModals/MassDeleteDeviceModal/MassDeleteDeviceModal';
import ResourceListEmptyState from '../../common/ResourceListEmptyState';
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
import EnrollmentRequestList from './EnrollmentRequestList';
import { FilterStatusMap } from './types';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';

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
  {
    name: t('Last seen'),
  },
];

interface DeviceTableProps {
  devices: Array<Device>;
  refetch: VoidFunction;
  ownerFleets: string[];
  activeStatuses: FilterStatusMap;
  hasFiltersEnabled: boolean;
  nameOrAlias: string | undefined;
  setNameOrAlias: (text: string) => void;
  setOwnerFleets: (ownerFleets: string[]) => void;
  setActiveStatuses: (activeStatuses: FilterStatusMap) => void;
  allLabels: FlightCtlLabel[];
  selectedLabels: FlightCtlLabel[];
  setSelectedLabels: (labels: FlightCtlLabel[]) => void;
  fleets: Fleet[];
  isFilterUpdating: boolean;
  deviceColumns: ApiSortTableColumn[];
  // getSortParams: (columnIndex: number) => ThProps['sort'];
}

export const DeviceTable = ({
  devices,
  refetch,
  nameOrAlias,
  setNameOrAlias,
  ownerFleets,
  setOwnerFleets,
  activeStatuses,
  setActiveStatuses,
  allLabels,
  selectedLabels,
  setSelectedLabels,
  hasFiltersEnabled,
  fleets,
  isFilterUpdating,
  deviceColumns,
}: DeviceTableProps) => {
  const { t } = useTranslation();
  const [addDeviceModal, setAddDeviceModal] = React.useState(false);
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);
  const { remove } = useFetch();

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
        nameOrAlias={nameOrAlias}
        setNameOrAlias={setNameOrAlias}
        ownerFleets={ownerFleets}
        setOwnerFleets={setOwnerFleets}
        activeStatuses={activeStatuses}
        setActiveStatuses={setActiveStatuses}
        allLabels={allLabels}
        selectedLabels={selectedLabels}
        setSelectedLabels={setSelectedLabels}
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
        loading={isFilterUpdating}
        columns={deviceColumns}
        emptyFilters={!hasFiltersEnabled}
        emptyData={devices.length === 0}
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
      >
        <Tbody>
          {devices.map((device, index) => (
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
      {!hasFiltersEnabled && devices.length === 0 && <DeviceEmptyState onAddDevice={() => setAddDeviceModal(true)} />}
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

const DevicesPage = () => {
  const { t } = useTranslation();
  const deviceColumns = React.useMemo(() => getDeviceColumns(t), [t]);

  const {
    nameOrAlias,
    setNameOrAlias,
    ownerFleets,
    activeStatuses,
    hasFiltersEnabled,
    setOwnerFleets,
    setActiveStatuses,
    selectedLabels,
    setSelectedLabels,
  } = useDeviceBackendFilters();
  const [data, loading, error, updating, refetch, allLabels] = useDevices({
    nameOrAlias,
    ownerFleets,
    activeStatuses,
    labels: selectedLabels,
  });

  const [fleetsList, flLoading, flError] = useFetchPeriodically<FleetList>({
    endpoint: 'fleets?sortBy=metadata.name&sortOrder=Asc',
  });

  return (
    <PageSection variant={PageSectionVariants.light}>
      <EnrollmentRequestList refetchDevices={refetch} />

      <ListPage title={t('Devices')}>
        <ListPageBody error={error || flError} loading={loading || flLoading}>
          <DeviceTable
            devices={data}
            allLabels={allLabels}
            refetch={refetch}
            nameOrAlias={nameOrAlias}
            setNameOrAlias={setNameOrAlias}
            hasFiltersEnabled={hasFiltersEnabled || updating}
            ownerFleets={ownerFleets}
            activeStatuses={activeStatuses}
            setOwnerFleets={setOwnerFleets}
            setActiveStatuses={setActiveStatuses}
            selectedLabels={selectedLabels}
            setSelectedLabels={setSelectedLabels}
            fleets={fleetsList?.items || []}
            isFilterUpdating={updating}
            deviceColumns={deviceColumns}
          />
        </ListPageBody>
      </ListPage>
    </PageSection>
  );
};

export default DevicesPage;
