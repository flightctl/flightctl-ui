import * as React from 'react';

import { DeviceUpdatedStatusType } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import StatusDisplay from './StatusDisplay';
import { getSystemUpdateStatusItems } from '../../utils/status/system';

const SystemUpdateStatus = ({ status }: { status: DeviceUpdatedStatusType | undefined }) => {
  const { t } = useTranslation();

  const statusItems = getSystemUpdateStatusItems(t);

  const item = statusItems.find((statusItem) => {
    return statusItem.id === status;
  });
  return <StatusDisplay item={item} />;
};

export default SystemUpdateStatus;
