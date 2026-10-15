import * as React from 'react';

import { type DeviceUpdatedStatus } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { getSystemUpdateStatusItems } from '../../utils/status/system';
import StatusDisplay from './StatusDisplay';

const SystemUpdateStatus = ({ updateStatus }: { updateStatus?: DeviceUpdatedStatus }) => {
  const { t } = useTranslation();
  const statusItems = getSystemUpdateStatusItems(t);

  const item = statusItems.find((statusItem) => {
    return statusItem.id === updateStatus?.status;
  });
  const stageItem = item && updateStatus?.stage ? { ...item, label: t(updateStatus.stage) } : item;
  return <StatusDisplay item={stageItem} message={updateStatus?.info} />;
};

export default SystemUpdateStatus;
