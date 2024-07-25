import * as React from 'react';

import { ConditionStatus, ConditionType, DeviceStatus, DeviceUpdatedStatusType } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import StatusDisplay from './StatusDisplay';
import { getSystemUpdateStatusItems } from '../../utils/status/system';
import { getConditionMessage } from '../../utils/error';

const SystemUpdateStatus = ({ deviceStatus }: { deviceStatus?: DeviceStatus }) => {
  const { t } = useTranslation();
  const statusItems = getSystemUpdateStatusItems(t);

  // TODO Until Update status if fully implemented in the backend, we check for the "SpecValid" error condition
  const invalidSpec = deviceStatus?.conditions?.find(
    (c) => c.type === ConditionType.DeviceSpecValid && c.status === ConditionStatus.ConditionStatusFalse,
  );

  let computedStatus = deviceStatus?.updated.status;
  let message = deviceStatus?.updated.info;

  if (invalidSpec) {
    computedStatus = DeviceUpdatedStatusType.DeviceUpdatedStatusOutOfDate;
    message = getConditionMessage(invalidSpec, t('Invalid device spec'));
  }

  const item = statusItems.find((statusItem) => {
    return statusItem.id === computedStatus;
  });
  return <StatusDisplay item={item} message={message} />;
};

export default SystemUpdateStatus;
