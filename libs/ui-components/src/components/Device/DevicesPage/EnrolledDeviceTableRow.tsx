import * as React from 'react';
import { ActionsColumn, OnSelect, Td, Tr } from '@patternfly/react-table';

import { Device } from '@flightctl/types';
import DeviceFleet from '../DeviceDetails/DeviceFleet';
import { getDecommissionDisabledReason, getEditDisabledReason, getResumeDisabledReason } from '../../../utils/devices';
import { getDisabledTooltipProps } from '../../../utils/tooltip';
import { ListAction } from '../../ListPage/types';
import ApplicationSummaryStatus from '../../Status/ApplicationSummaryStatus';
import DeviceStatus from '../../Status/DeviceStatus';
import SystemUpdateStatus from '../../Status/SystemUpdateStatus';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTE, useNavigate } from '../../../hooks/useNavigate';
import ResourceLink from '../../common/ResourceLink';

type EnrolledDeviceTableRowProps = {
  device: Device;
  rowIndex: number;
  onRowSelect: (device: Device) => OnSelect;
  isRowSelected: (device: Device) => boolean;
  canEdit: boolean;
  canDecommission: boolean;
  decommissionAction: ListAction;
  canResume: boolean;
  resumeAction: ListAction;
};

const EnrolledDeviceTableRow = ({
  device,
  rowIndex,
  onRowSelect,
  isRowSelected,
  canEdit,
  canDecommission,
  decommissionAction,
  canResume,
  resumeAction,
}: EnrolledDeviceTableRowProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deviceName = device.metadata.name as string;
  const deviceAlias = device.metadata.labels?.alias;
  const editActionProps = getDisabledTooltipProps(getEditDisabledReason(device, t));
  const decommissionDisabledReason = getDecommissionDisabledReason(device, t);
  const resumeDisabledReason = getResumeDisabledReason(device, t);

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
      <Td dataLabel={t('Update status')}>
        <SystemUpdateStatus deviceStatus={device.status} />
      </Td>
      <Td isActionCell>
        <ActionsColumn
          items={[
            ...(canEdit
              ? [
                  {
                    title: t('Edit device configurations'),
                    onClick: () => navigate({ route: ROUTE.DEVICE_EDIT, postfix: deviceName }),
                    ...editActionProps,
                  },
                ]
              : []),
            {
              title: t('View device details'),
              onClick: () => navigate({ route: ROUTE.DEVICE_DETAILS, postfix: deviceName }),
            },
            ...(canResume
              ? [
                  resumeAction({
                    resourceId: deviceName,
                    resourceName: deviceAlias,
                    disabledReason: resumeDisabledReason,
                  }),
                ]
              : []),
            ...(canDecommission
              ? [
                  decommissionAction({
                    resourceId: deviceName,
                    resourceName: deviceAlias,
                    disabledReason: decommissionDisabledReason,
                  }),
                ]
              : []),
          ]}
        />
      </Td>
    </Tr>
  );
};

export default EnrolledDeviceTableRow;
