import * as React from 'react';

import { DeviceStatus } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { getSystemUpdateStatusItems } from '../../utils/status/system';
import StatusDisplay from './StatusDisplay';

const SystemUpdateStatus = ({ deviceStatus }: { deviceStatus?: DeviceStatus }) => {
  const { t } = useTranslation();
  const statusItems = getSystemUpdateStatusItems(t);

  const item = statusItems.find((statusItem) => {
    return statusItem.id === deviceStatus?.updated.status;
  });
  return <StatusDisplay item={item} message={deviceStatus?.updated.info} />;
};

export default SystemUpdateStatus;
