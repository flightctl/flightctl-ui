import * as React from 'react';
import { ActionsColumn, OnSelect, Td, Tr } from '@patternfly/react-table';

import { Device } from '@flightctl/types';
import { getDisabledTooltipProps } from '../../../utils/tooltip';
import DeviceFleet from '../DeviceDetails/DeviceFleet';
import { timeSinceText } from '../../../utils/dates';
import { getDecommissionDisabledReason, getEditDisabledReason } from '../../../utils/devices';
import { ListAction } from '../../ListPage/types';
import ApplicationSummaryStatus from '../../Status/ApplicationSummaryStatus';
import DeviceStatus from '../../Status/DeviceStatus';
import SystemUpdateStatus from '../../Status/SystemUpdateStatus';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import ResourceLink from '../../common/ResourceLink';

type DeviceTableRowProps = {
  device: Device;
  decommissionAction: ListAction;
  rowIndex: number;
  onRowSelect: (device: Device) => OnSelect;
  isRowSelected: (device: Device) => boolean;
};

const DeviceTableRow = ({ device, decommissionAction, rowIndex, onRowSelect, isRowSelected }: DeviceTableRowProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deviceName = device.metadata.name as string;
  const deviceAlias = device.metadata.labels?.alias;

  const decomissionDisabledReason = getDecommissionDisabledReason(device, t);
  const editActionProps = getDisabledTooltipProps(decomissionDisabledReason || getEditDisabledReason(device, t));

  return (
    <Tr>
      <Td
        select={{
          rowIndex,
          onSelect: onRowSelect(device),
          isSelected: isRowSelected(device),
        }}
      />
      <Td dataLabel={t('Alias')}>
        <ResourceLink id={deviceName} name={deviceAlias || t('Untitled')} routeLink={ROUTE.DEVICE_DETAILS} />
      </Td>
      <Td dataLabel={t('Name')}>
        <ResourceLink id={deviceName} />
      </Td>
      <Td dataLabel={t('Fleet')}>
        <DeviceFleet device={device} />
      </Td>
      <Td dataLabel={t('Application status')}>
        <ApplicationSummaryStatus statusSummary={device.status?.applicationsSummary} />
      </Td>
      <Td dataLabel={t('Device status')}>
        <DeviceStatus deviceStatus={device.status} />
      </Td>
      <Td dataLabel={t('System update status')}>
        <SystemUpdateStatus deviceStatus={device.status} />
      </Td>
      <Td dataLabel={t('Last seen')}>{timeSinceText(t, device.status?.lastSeen)}</Td>
      <Td isActionCell>
        <ActionsColumn
          items={[
            {
              title: t('Edit device configurations'),
              onClick: () => navigate({ route: ROUTE.DEVICE_EDIT, postfix: deviceName }),
              ...editActionProps,
            },
            {
              title: t('View device details'),
              onClick: () => navigate({ route: ROUTE.DEVICE_DETAILS, postfix: deviceName }),
            },
            decommissionAction({
              resourceId: deviceName,
              resourceName: deviceAlias,
              disabledReason: decomissionDisabledReason,
            }),
          ]}
        />
      </Td>
    </Tr>
  );
};

export default DeviceTableRow;
