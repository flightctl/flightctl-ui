import * as React from 'react';
import { Link } from 'react-router-dom';
import { ActionsColumn, IAction, OnSelect, Td, Tr } from '@patternfly/react-table';

import { Device } from '@types';
import { getFingerprintDisplay } from '@app/utils/devices';
import DeviceFleet from './DeviceDetails/DeviceFleet';
import { getDateDisplay } from '@app/utils/dates';
import { DeleteListActionResult } from '../ListPage/types';
import DeviceStatus from './DeviceDetails/DeviceStatus';
import { useTranslation } from 'react-i18next';

type DeviceTableRowProps = {
  device: Device;
  deleteAction: DeleteListActionResult['deleteAction'];
  rowIndex: number;
  onRowSelect: (device: Device) => OnSelect;
  isRowSelected: (device: Device) => boolean;
  editLabelsAction: ({ resourceId, disabledReason }: { resourceId: string; disabledReason?: string }) => IAction;
};

const DeviceTableRow: React.FC<DeviceTableRowProps> = ({
  device,
  deleteAction,
  rowIndex,
  onRowSelect,
  isRowSelected,
  editLabelsAction,
}) => {
  const { t } = useTranslation();
  const deviceName = device.metadata.name as string;
  const displayName = device.metadata.labels?.displayName;
  return (
    <Tr>
      <Td
        select={{
          rowIndex,
          onSelect: onRowSelect(device),
          isSelected: isRowSelected(device),
        }}
      />
      <Td dataLabel={t('Fingerprint')}>
        <Link to={`/devicemanagement/devices/${deviceName}`}>{getFingerprintDisplay(device)}</Link>
      </Td>
      <Td dataLabel={t('Name')}>{displayName || '-'}</Td>
      <Td dataLabel={t('Status')}>
        <DeviceStatus device={device} />
      </Td>
      <Td dataLabel={t('Fleet')}>
        <DeviceFleet deviceMetadata={device.metadata} />
      </Td>
      <Td dataLabel={t('Created at')}>{getDateDisplay(device.metadata.creationTimestamp)}</Td>
      <Td dataLabel={t('Operating system')}>{device.status?.systemInfo?.operatingSystem || '-'}</Td>
      <Td isActionCell>
        <ActionsColumn
          items={[
            deleteAction({
              resourceId: deviceName,
              resourceName: displayName,
            }),
            editLabelsAction({
              resourceId: deviceName,
            }),
          ]}
        />
      </Td>
    </Tr>
  );
};

export default DeviceTableRow;
