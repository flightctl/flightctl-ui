import * as React from 'react';

import { ConditionStatus, ConditionType, DeviceStatus } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import StatusDisplay, { StatusDisplayContent } from './StatusDisplay';
import { getSystemUpdateStatusItems } from '../../utils/status/system';

const SystemUpdateStatus = ({ deviceStatus }: { deviceStatus?: DeviceStatus }) => {
  const { t } = useTranslation();
  const statusItems = getSystemUpdateStatusItems(t);

  // TODO Until Update status if fully implemented in the backend, we check for the "SpecValid" error condition
  const invalidSpec = deviceStatus?.conditions?.find(
    (c) => c.type === ConditionType.DeviceSpecValid && c.status === ConditionStatus.ConditionStatusFalse,
  );

  if (invalidSpec) {
    const title = t('Invalid configuration');
    return <StatusDisplayContent level="danger" label={title} messageTitle={title} message={invalidSpec.message} />;
  }

  const item = statusItems.find((statusItem) => {
    return statusItem.id === deviceStatus?.updated.status;
  });
  return <StatusDisplay item={item} message={deviceStatus?.updated.info} />;
};

export default SystemUpdateStatus;
