import * as React from 'react';
import { Link } from 'react-router-dom';
import { ActionsColumn, IAction, Td, Tr } from '@patternfly/react-table';

import { Device } from '@types';
import { DeleteListActionResult } from '../ListPage/ListPageActions';
import { getDeviceFleet, getFingerprintDisplay } from '@app/utils/devices';
import { getDateDisplay } from '@app/utils/dates';
import DeviceStatus from './DeviceDetails/DeviceStatus';
import DeviceFleet from './DeviceDetails/DeviceFleet';

const DeviceTableRow = ({
  device,
  deleteAction,
  editLabelsAction,
}: {
  device: Device;
  deleteAction: DeleteListActionResult['deleteAction'];
  editLabelsAction: ({
    resourceId,
    disabledReason,
  }: {
    resourceId: string;
    disabledReason: string | undefined;
  }) => IAction;
}) => {
  const deviceName = device.metadata.name as string;
  const displayName = device.metadata.labels?.displayName;
  const boundFleet = getDeviceFleet(device.metadata);
  return (
    <Tr key={deviceName}>
      <Td dataLabel="Fingerprint">
        <Link to={`/devicemanagement/devices/${deviceName}`}>{getFingerprintDisplay(device)}</Link>
      </Td>
      <Td dataLabel="Name">{displayName || '-'}</Td>
      <Td dataLabel="Status">
        <DeviceStatus device={device} />
      </Td>
      <Td dataLabel="Fleet">
        <DeviceFleet deviceMetadata={device.metadata} />
      </Td>
      <Td dataLabel="Created at">{getDateDisplay(device.metadata.creationTimestamp)}</Td>
      <Td dataLabel="Operating system">{device.status?.systemInfo?.operatingSystem || '-'}</Td>
      <Td isActionCell>
        <ActionsColumn
          items={[
            deleteAction({
              resourceId: deviceName,
              resourceName: displayName,
            }),
            editLabelsAction({
              resourceId: deviceName,
              disabledReason: boundFleet ? 'Devices bound to a fleet cannot be edited' : '',
            }),
          ]}
        />
      </Td>
    </Tr>
  );
};

export default DeviceTableRow;
