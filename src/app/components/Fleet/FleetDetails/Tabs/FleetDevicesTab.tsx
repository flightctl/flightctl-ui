import * as React from 'react';
import { Alert, Bullseye, EmptyState, EmptyStateBody, Spinner } from '@patternfly/react-core';

import { getErrorMessage } from '@app/utils/error';
import { DeviceTable } from '@app/components/Device/DeviceList';
import { useFetchPeriodically } from '@app/hooks/useFetchPeriodically';
import { DeviceList } from '@types';

const FleetDevicesTab = ({ fleetName }: { fleetName: string }) => {
  const [deviceList, loadingDevices, devicesError, refetch] = useFetchPeriodically<DeviceList>({
    endpoint: `devices?owner=Fleet/${fleetName}`,
  });

  let tabContent;
  if (loadingDevices || deviceList === undefined) {
    tabContent = (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }
  if (deviceList?.items) {
    tabContent =
      deviceList.items.length === 0 ? (
        <EmptyState>
          <EmptyStateBody>The fleet has no associated devices</EmptyStateBody>
        </EmptyState>
      ) : (
        <DeviceTable resources={deviceList.items} refetch={refetch} showFleet={false} />
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
