import * as React from 'react';

import { DeviceUpdatedStatus } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import StatusDisplay from './StatusDisplay';
import { getSystemUpdateStatusItems } from '../../utils/status/system';

const SystemUpdateStatus = ({ updateStatus }: { updateStatus: DeviceUpdatedStatus | undefined }) => {
  const { t } = useTranslation();

  const statusItems = getSystemUpdateStatusItems(t);

  const item = statusItems.find((statusItem) => {
    return statusItem.id === updateStatus?.status;
  });
  return <StatusDisplay item={item} message={updateStatus?.info} />;
};

export default SystemUpdateStatus;
