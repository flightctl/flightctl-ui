import * as React from 'react';
import { DescriptionList } from '@patternfly/react-core';

import { type Device } from '@flightctl/types';
import { useTranslation } from '../../../../hooks/useTranslation';
import { getDeviceResourceStatusLevel } from '../../../../utils/status/resources';
import DeviceDetailsStatusAccent from '../DeviceDetailsStatusAccent';
import DeviceResourceStatus, { MonitorType } from '../../../Status/DeviceResourceStatus';

type SystemResourcesContentProps = {
  device: Required<Device>;
};

const SystemResourcesContent = ({ device }: SystemResourcesContentProps) => {
  const { t } = useTranslation();

  return (
    <DescriptionList isCompact className="fctl-device-status-fields">
      <DeviceDetailsStatusAccent
        level={getDeviceResourceStatusLevel(device.status.resources.cpu)}
        statusLabel={t('CPU pressure')}
        statusContent={<DeviceResourceStatus device={device} monitorType={MonitorType.cpu} />}
      />
      <DeviceDetailsStatusAccent
        level={getDeviceResourceStatusLevel(device.status.resources.disk)}
        statusLabel={t('Disk pressure')}
        statusContent={<DeviceResourceStatus device={device} monitorType={MonitorType.disk} />}
      />
      <DeviceDetailsStatusAccent
        level={getDeviceResourceStatusLevel(device.status.resources.memory)}
        statusLabel={t('Memory pressure')}
        statusContent={<DeviceResourceStatus device={device} monitorType={MonitorType.memory} />}
      />
    </DescriptionList>
  );
};

export default SystemResourcesContent;
