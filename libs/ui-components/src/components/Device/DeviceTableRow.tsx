import * as React from 'react';
import { ActionsColumn, OnSelect, Td, Tr } from '@patternfly/react-table';

import { Device } from '@flightctl/types';
import DeviceFleet from './DeviceDetails/DeviceFleet';
import { getDateDisplay } from '../../utils/dates';
import { DeleteListActionResult } from '../ListPage/types';
import DeviceStatus from './DeviceDetails/DeviceStatus';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../hooks/useNavigate';
import DisplayName from '../common/DisplayName';

type DeviceTableRowProps = {
  device: Device;
  deleteAction: DeleteListActionResult['deleteAction'];
  rowIndex: number;
  onRowSelect: (device: Device) => OnSelect;
  isRowSelected: (device: Device) => boolean;
};

const DeviceTableRow: React.FC<DeviceTableRowProps> = ({
  device,
  deleteAction,
  rowIndex,
  onRowSelect,
  isRowSelected,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      <Td dataLabel={t('Name')}>{displayName || '-'}</Td>
      <Td dataLabel={t('Fingerprint')}>
        <DisplayName name={deviceName} routeLink={ROUTE.DEVICE_DETAILS} />
      </Td>
      <Td dataLabel={t('Fleet')}>
        <DeviceFleet deviceMetadata={device.metadata} />
      </Td>
      <Td dataLabel={t('Status')}>
        <DeviceStatus device={device} />
      </Td>
      <Td dataLabel={t('Created at')}>{getDateDisplay(device.metadata.creationTimestamp)}</Td>
      <Td isActionCell>
        <ActionsColumn
          items={[
            {
              title: t('Edit device'),
              onClick: () => navigate({ route: ROUTE.DEVICE_DETAILS, postfix: deviceName }),
            },
            {
              title: t('Terminal'),
              onClick: () => navigate({ route: ROUTE.DEVICE_TERMINAL, postfix: deviceName }),
            },
            deleteAction({
              resourceId: deviceName,
              resourceName: displayName,
            }),
          ]}
        />
      </Td>
    </Tr>
  );
};

export default DeviceTableRow;
