import * as React from 'react';

import { DeviceList } from '@flightctl/types';

import ListPage from '../../ListPage/ListPage';
import ListPageBody from '../../ListPage/ListPageBody';
import { useTranslation } from '../../../hooks/useTranslation';
import { useTablePagination } from '../../../hooks/useTablePagination';
import { isDeviceEnrolled } from '../../../utils/devices';
import { useDevices } from './useDevices';
import { useDeviceBackendFilters } from './useDeviceBackendFilters';

import EnrollmentRequestList from '../../EnrollmentRequest/EnrollmentRequestList';
import PageWithPermissions from '../../common/PageWithPermissions';
import { RESOURCE, VERB } from '../../../types/rbac';
import { useAccessReview } from '../../../hooks/useAccessReview';
import EnrolledDevicesTable from './EnrolledDevicesTable';
import DecommissionedDevicesTable from './DecommissionedDevicesTable';

const removeDecommissionedDevices = (data: DeviceList) => {
  data.items = data.items.filter(isDeviceEnrolled);
};

const DevicesPage = ({ canListER }: { canListER: boolean }) => {
  const { t } = useTranslation();

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
  const [onlyDecommissioned, setOnlyDecommissioned] = React.useState<boolean>(false);
  const [showDeviceListBadge, setShowDeviceListBadge] = React.useState<boolean>(true);

  const onEmptyErChanged = React.useCallback((isEmpty: boolean) => {
    if (isEmpty) {
      setShowDeviceListBadge(true);
    } else {
      setShowDeviceListBadge(false);
    }
  }, []);

  const { currentPage, setCurrentPage, onPageFetched, nextContinue, itemCount } = useTablePagination<DeviceList>(
    onlyDecommissioned ? undefined : removeDecommissionedDevices,
  );

  const [data, loading, error, updating, refetch] = useDevices({
    nameOrAlias,
    ownerFleets,
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
      {canListER && <EnrollmentRequestList onEmptyListChanged={onEmptyErChanged} refetchDevices={refetch} />}

      <ListPage title={t('Devices')} withBadge={showDeviceListBadge}>
        {/* When searching for decommissioned devices we want to avoid showing the enrolled devices */}
        <ListPageBody error={error} loading={loading || (onlyDecommissioned && updating && !hasFiltersEnabled)}>
          {onlyDecommissioned ? (
            <DecommissionedDevicesTable
              devices={data}
              refetch={refetch}
              nameOrAlias={nameOrAlias}
              setNameOrAlias={setNameOrAlias}
              hasFiltersEnabled={hasFiltersEnabled || updating}
              setOnlyDecommissioned={setOnlyDecommissioned}
              isFilterUpdating={updating}
              pagination={pagination}
            />
          ) : (
            <EnrolledDevicesTable
              devices={data}
              nameOrAlias={nameOrAlias}
              setNameOrAlias={setNameOrAlias}
              hasFiltersEnabled={hasFiltersEnabled || updating}
              ownerFleets={ownerFleets}
              setOnlyDecommissioned={setOnlyDecommissioned}
              activeStatuses={activeStatuses}
              setOwnerFleets={setOwnerFleets}
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
  const [permissions, loading] = useAccessReview([
    { kind: RESOURCE.DEVICE, verb: VERB.LIST },
    { kind: RESOURCE.ENROLLMENT_REQUEST, verb: VERB.LIST },
  ]);
  const [canListDevice = false, canListER = false] = permissions;

  return (
    <PageWithPermissions loading={loading} allowed={canListDevice || canListER}>
      {canListDevice ? <DevicesPage canListER={canListER} /> : <EnrollmentRequestList isStandalone />}
    </PageWithPermissions>
  );
};

export default DevicesPageWithPermissions;
