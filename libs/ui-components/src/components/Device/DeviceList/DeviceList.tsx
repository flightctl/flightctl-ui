import * as React from 'react';
import {
  Button,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  SelectList,
  SelectOption,
  ToolbarItem,
} from '@patternfly/react-core';
import { Tbody } from '@patternfly/react-table';
import { MicrochipIcon } from '@patternfly/react-icons/dist/js/icons/microchip-icon';
import { Trans } from 'react-i18next';
import { TFunction } from 'i18next';

import { useFetch } from '../../../hooks/useFetch';
import { EnrollmentRequest, Fleet, FleetList } from '@flightctl/types';

import ListPage from '../../ListPage/ListPage';
import ListPageBody from '../../ListPage/ListPageBody';
import { useDeleteListAction } from '../../ListPage/ListPageActions';
import AddDeviceModal from '../AddDeviceModal/AddDeviceModal';
import { sortByDisplayName, sortByLastSeenDate, sortByName } from '../../../utils/sort/generic';
import { sortDeviceStatus, sortDevicesByFleet } from '../../../utils/sort/device';
import Table, { TableColumn } from '../../Table/Table';
import EnrollmentRequestTableRow from '../../EnrollmentRequest/EnrollmentRequestTableRow';
import DeviceTableToolbar from './DeviceTableToolbar';
import { useDeviceFilters } from './useDeviceFilters';
import DeviceTableRow from './DeviceTableRow';
import TableActions from '../../Table/TableActions';
import { getResourceId } from '../../../utils/resource';
import { DeviceLikeResource, FlightCtlLabel, isEnrollmentRequest } from '../../../types/extraTypes';
import MassDeleteDeviceModal from '../../modals/massModals/MassDeleteDeviceModal/MassDeleteDeviceModal';
import MassApproveDeviceModal from '../../modals/massModals/MassApproveDeviceModal/MassApproveDeviceModal';
import ApproveDeviceModal from '../../modals/ApproveDeviceModal/ApproveDeviceModal';
import ResourceListEmptyState from '../../common/ResourceListEmptyState';
import { useTableSort } from '../../../hooks/useTableSort';
import { useTableSelect } from '../../../hooks/useTableSelect';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link, ROUTE } from '../../../hooks/useNavigate';
import { useDeviceLikeResources } from './useDeviceLikeResources';
import { useDeviceBackendFilters } from './useDeviceBackendFilters';
import {
  getApplicatioStatusHelperText,
  getDeviceStatusHelperText,
  getUpdateStatusHelperText,
} from '../../Status/utils';
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
          <Link to={ROUTE.FLEETS}>start with a fleet</Link> and add devices into it.
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

const getDeviceColumns = (t: TFunction): TableColumn<DeviceLikeResource>[] => [
  {
    name: t('Name'),
    onSort: sortByDisplayName,
  },
  {
    name: t('Fingerprint'),
    onSort: sortByName,
  },
  {
    name: t('Fleet'),
    onSort: sortDevicesByFleet,
  },
  {
    name: t('Application status'),
    helperText: getApplicatioStatusHelperText(t),
    onSort: (resources: Array<DeviceLikeResource>) => sortDeviceStatus(resources, 'ApplicationStatus'),
  },
  {
    name: t('Device status'),
    helperText: getDeviceStatusHelperText(t),
    onSort: (resources: Array<DeviceLikeResource>) => sortDeviceStatus(resources, 'DeviceStatus'),
    defaultSort: true,
  },
  {
    name: t('Update status'),
    helperText: getUpdateStatusHelperText(t),
    onSort: (resources: Array<DeviceLikeResource>) => sortDeviceStatus(resources, 'SystemUpdateStatus'),
  },
  {
    name: t('Last seen'),
    onSort: sortByLastSeenDate,
  },
];

interface DeviceTableProps {
  resources: Array<DeviceLikeResource>;
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
  resources,
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
  const [requestId, setRequestId] = React.useState<string>();
  const [addDeviceModal, setAddDeviceModal] = React.useState(false);
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = React.useState(false);
  const [isMassApproveModalOpen, setIsMassApproveModalOpen] = React.useState(false);
  const { remove } = useFetch();

  const deviceColumns = React.useMemo(() => getDeviceColumns(t), [t]);

  const { filteredData, hasFiltersEnabled: hasUIFiltersEnabled, ...rest } = useDeviceFilters(resources);
  const { getSortParams, sortedData } = useTableSort(filteredData, deviceColumns);

  const { onRowSelect, hasSelectedRows, isAllSelected, isRowSelected, setAllSelected } = useTableSelect();

  const { deleteAction: deleteDeviceAction, deleteModal: deleteDeviceModal } = useDeleteListAction({
    resourceType: 'Device',
    onDelete: async (resourceId: string) => {
      await remove(`devices/${resourceId}`);
      refetch();
    },
  });

  const { deleteAction: deleteErAction, deleteModal: deleteErModal } = useDeleteListAction({
    resourceType: 'Enrollment request',
    onDelete: async (resourceId: string) => {
      await remove(`enrollmentrequests/${resourceId}`);
      refetch();
    },
  });

  const currentEnrollmentRequest = resources.find(
    (res) => res.metadata.name === requestId && isEnrollmentRequest(res),
  ) as EnrollmentRequest | undefined;

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
        resources={resources}
        fleets={fleets}
        isFilterUpdating={isFilterUpdating}
      >
        <ToolbarItem>
          <Button onClick={() => setAddDeviceModal(true)}>{t('Add devices')}</Button>
        </ToolbarItem>
        <ToolbarItem>
          <TableActions>
            <SelectList>
              <SelectOption isDisabled={!hasSelectedRows} onClick={() => setIsMassApproveModalOpen(true)}>
                {t('Approve')}
              </SelectOption>
              <SelectOption isDisabled={!hasSelectedRows} onClick={() => setIsMassDeleteModalOpen(true)}>
                {t('Delete')}
              </SelectOption>
            </SelectList>
          </TableActions>
        </ToolbarItem>
      </DeviceTableToolbar>
      <Table
        aria-label={t('Devices table')}
        columns={deviceColumns}
        emptyFilters={filteredData.length === 0 && (hasFiltersEnabled || hasUIFiltersEnabled)}
        getSortParams={getSortParams}
        isAllSelected={isAllSelected}
        onSelectAll={setAllSelected}
      >
        <Tbody>
          {sortedData.map((resource, index) =>
            isEnrollmentRequest(resource) ? (
              <EnrollmentRequestTableRow
                key={getResourceId(resource)}
                er={resource}
                deleteAction={deleteErAction}
                onRowSelect={onRowSelect}
                isRowSelected={isRowSelected}
                rowIndex={index}
                onApprove={setRequestId}
              />
            ) : (
              <DeviceTableRow
                key={getResourceId(resource)}
                device={resource}
                deleteAction={deleteDeviceAction}
                onRowSelect={onRowSelect}
                isRowSelected={isRowSelected}
                rowIndex={index}
              />
            ),
          )}
        </Tbody>
      </Table>
      {!hasFiltersEnabled && !hasUIFiltersEnabled && resources.length === 0 && (
        <DeviceEmptyState onAddDevice={() => setAddDeviceModal(true)} />
      )}
      {deleteDeviceModal}
      {deleteErModal}
      {addDeviceModal && <AddDeviceModal onClose={() => setAddDeviceModal(false)} />}
      {currentEnrollmentRequest && (
        <ApproveDeviceModal
          enrollmentRequest={currentEnrollmentRequest}
          onClose={(updateList) => {
            setRequestId(undefined);
            updateList && refetch();
          }}
        />
      )}
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
      {isMassApproveModalOpen && (
        <MassApproveDeviceModal
          onClose={() => setIsMassApproveModalOpen(false)}
          resources={sortedData.filter(isRowSelected)}
          onApproveSuccess={() => {
            setAllSelected(false);
            setIsMassApproveModalOpen(false);
            refetch();
          }}
        />
      )}
    </>
  );
};

const DeviceList = () => {
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
  const [data, loading, error, updating, refetch] = useDeviceLikeResources({
    ownerFleets,
    activeStatuses,
    labels: selectedLabels,
  });

  const [fleetsList, flLoading, flError] = useFetchPeriodically<FleetList>({
    endpoint: 'fleets',
  });

  return (
    <>
      <ListPage title={t('Devices')}>
        <ListPageBody error={error || flError} loading={loading || flLoading}>
          <DeviceTable
            resources={data}
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
    </>
  );
};

export default DeviceList;
