import * as React from 'react';
import { ActionsColumn, OnSelect, Td, Tr } from '@patternfly/react-table';

import { Device } from '@flightctl/types';
import { timeSinceText } from '../../../utils/dates';
import { ListAction } from '../../ListPage/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import ResourceLink from '../../common/ResourceLink';
import DeviceLifecycleStatus from '../../Status/DeviceLifecycleStatus';

type DecommissionedDeviceTableRowProps = {
  device: Device;
  rowIndex: number;
  onRowSelect: (device: Device) => OnSelect;
  isRowSelected: (device: Device) => boolean;
  canDelete: boolean;
  canEdit: boolean;
  deleteAction: ListAction;
};

const DecommissionedDeviceTableRow = ({
  device,
  deleteAction,
  rowIndex,
  onRowSelect,
  isRowSelected,
  canDelete,
  canEdit,
}: DecommissionedDeviceTableRowProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const deviceName = device.metadata.name as string;
  const deviceAlias = device.metadata.labels?.alias;

  return (
    <Tr>
      <Td
        select={{
          rowIndex,
          onSelect: onRowSelect(device),
          isSelected: isRowSelected(device),
        }}
      />
      <Td dataLabel={t('Name')}>
        <ResourceLink id={deviceName} routeLink={ROUTE.DEVICE_DETAILS} />
      </Td>
      <Td dataLabel={t('Device status')}>
        <DeviceLifecycleStatus device={device} />
      </Td>
      <Td dataLabel={t('Last seen')}>{timeSinceText(t, device.status?.lastSeen)}</Td>
      {canDelete && (
        <Td isActionCell>
          <ActionsColumn
            items={[
              ...(canEdit
                ? [
                    {
                      title: t('Edit device configurations'),
                      onClick: () => navigate({ route: ROUTE.DEVICE_EDIT, postfix: deviceName }),
                      isAriaDisabled: true,
                      tooltipProps: {
                        content: t('Device already started decommissioning and cannot be edited.'),
                      },
                    },
                  ]
                : []),
              {
                title: t('View device details'),
                onClick: () => navigate({ route: ROUTE.DEVICE_DETAILS, postfix: deviceName }),
              },
              ...(canDelete
                ? [
                    deleteAction({
                      resourceId: deviceName,
                      resourceName: deviceAlias,
                    }),
                  ]
                : []),
            ]}
          />
        </Td>
      )}
    </Tr>
  );
};

export default DecommissionedDeviceTableRow;
