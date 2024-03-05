import * as React from 'react';
import { Alert, EmptyState, EmptyStateBody, Spinner } from '@patternfly/react-core';

import { getErrorMessage } from '@app/utils/error';
import { DeviceTable } from '@app/components/Device/DeviceList';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { DeviceList } from '@types';

const FleetDevicesTab = ({
  fleetName,
  onDevicesLoaded,
}: {
  fleetName: string;
  onDevicesLoaded: (deviceCount: number) => void;
}) => {
  const [deviceList, loadingDevices, devicesError, refetch] = useFetchPeriodically<DeviceList>({
    endpoint: `devices?owner=Fleet/${fleetName}`,
  });

  React.useEffect(() => {
    onDevicesLoaded(deviceList?.items?.length || 0);
  }, [deviceList, onDevicesLoaded]);

  let tabContent;
  if (loadingDevices || deviceList === undefined) {
    tabContent = <Spinner />;
  }
  if (deviceList?.items) {
    tabContent =
      deviceList.items.length === 0 ? (
        <EmptyState>
          <EmptyStateBody>The fleet has no associated devices</EmptyStateBody>
        </EmptyState>
      ) : (
        <DeviceTable devices={deviceList.items} refetch={refetch} showFleet={false} />
      );
  }

  return (
    <>
      {devicesError && <Alert title="Error loading the fleet devices">{getErrorMessage(devicesError)}</Alert>}
      {tabContent}
    </>
  );
};

export default FleetDevicesTab;
