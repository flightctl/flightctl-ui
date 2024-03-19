import * as React from 'react';
import { Device } from '@types';
import { DeleteListActionResult } from '../ListPage/ListPageActions';
import { getDeviceFleet, getFingerprintDisplay } from '@app/utils/devices';
import { ActionsColumn, Td, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';
import { ApprovalStatus } from '@app/utils/status/enrollmentRequest';
import DeviceFleet from './DeviceDetails/DeviceFleet';
import { getDateDisplay } from '@app/utils/dates';

const DeviceTableRow = ({
  device,
  deleteAction,
}: {
  device: Device;
  deleteAction: DeleteListActionResult['deleteAction'];
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
      <Td dataLabel="Status">{ApprovalStatus.Approved}</Td>
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
              // Deleting devices bound to fleets directly will be disabled soon
              disabledReason: boundFleet ? '' : '',
              // disabledReason: boundFleet ? 'Devices bound to a fleet cannot be deleted' : '',
            }),
          ]}
        />
      </Td>
    </Tr>
  );
};

export default DeviceTableRow;
