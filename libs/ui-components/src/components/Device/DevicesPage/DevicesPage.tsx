import * as React from 'react';

import { DeviceList } from '@flightctl/types';

import ListPage from '../../ListPage/ListPage';
import ListPageBody from '../../ListPage/ListPageBody';
import { useTranslation } from '../../../hooks/useTranslation';
import { useTablePagination } from '../../../hooks/useTablePagination';
import { useDevices } from './useDevices';
import { useDeviceBackendFilters } from './useDeviceBackendFilters';

import EnrollmentRequestList from '../../EnrollmentRequest/EnrollmentRequestList';
import PageWithPermissions from '../../common/PageWithPermissions';
import { RESOURCE, VERB } from '../../../types/rbac';
import { usePermissionsContext } from '../../common/PermissionsContext';
import EnrolledDevicesTable from './EnrolledDevicesTable';
import DecommissionedDevicesTable from './DecommissionedDevicesTable';

const DevicesPage = ({ canListER }: { canListER: boolean }) => {
  const { t } = useTranslation();

  const {
    textFilters,
    clearTextFilters,
    setTextFilter,
    ownerFleets,
    onlyFleetless,
    activeStatuses,
    hasFiltersEnabled,
    setOwnerFleets,
    setOnlyFleetless,
    setActiveStatuses,
    selectedLabels,
    setSelectedLabels,
  } = useDeviceBackendFilters();
  const [onlyDecommissioned, setOnlyDecommissioned] = React.useState<boolean>(false);

  const { currentPage, setCurrentPage, onPageFetched, nextContinue, itemCount } = useTablePagination<DeviceList>();

  const {
    devices: data,
    isLoading: loading,
    error,
    isUpdating: updating,
    refetch,
  } = useDevices({
    textFilters,
    ownerFleets,
    onlyFleetless,
    onlyDecommissioned,
    activeStatuses,
    labels: selectedLabels,
    nextContinue,
    onPageFetched,
  });

  const pagination = React.useMemo(
    () => ({
      currentPage,
      setCurrentPage,
      itemCount,
    }),
    [currentPage, setCurrentPage, itemCount],
  );

  return (
    <>
      {canListER && <EnrollmentRequestList refetchDevices={refetch} />}

      <ListPage title={t('Devices')}>
        {/* When searching for decommissioned devices we want to avoid showing the enrolled devices */}
        <ListPageBody error={error} loading={loading || (onlyDecommissioned && updating && !hasFiltersEnabled)}>
          {onlyDecommissioned ? (
            <DecommissionedDevicesTable
              devices={data}
              refetch={refetch}
              setTextFilter={setTextFilter}
              hasFiltersEnabled={hasFiltersEnabled || updating}
              setOnlyDecommissioned={setOnlyDecommissioned}
              isFilterUpdating={updating}
              pagination={pagination}
            />
          ) : (
            <EnrolledDevicesTable
              devices={data}
              textFilters={textFilters}
              setTextFilter={setTextFilter}
              clearTextFilters={clearTextFilters}
              hasFiltersEnabled={hasFiltersEnabled || updating}
              ownerFleets={ownerFleets}
              onlyFleetless={onlyFleetless}
              setOnlyDecommissioned={setOnlyDecommissioned}
              activeStatuses={activeStatuses}
              setOwnerFleets={setOwnerFleets}
              setOnlyFleetless={setOnlyFleetless}
              setActiveStatuses={setActiveStatuses}
              selectedLabels={selectedLabels}
              setSelectedLabels={setSelectedLabels}
              isFilterUpdating={updating}
              pagination={pagination}
              refetchDevices={refetch}
            />
          )}
        </ListPageBody>
      </ListPage>
    </>
  );
};

const DevicesPageWithPermissions = () => {
  const { checkPermissions, loading } = usePermissionsContext();
  const [canListDevice, canListER] = checkPermissions([
    { kind: RESOURCE.DEVICE, verb: VERB.LIST },
    { kind: RESOURCE.ENROLLMENT_REQUEST, verb: VERB.LIST },
  ]);

  return (
    <PageWithPermissions loading={loading} allowed={canListDevice || canListER}>
      {canListDevice ? <DevicesPage canListER={canListER} /> : <EnrollmentRequestList isStandalone />}
    </PageWithPermissions>
  );
};

export default DevicesPageWithPermissions;
