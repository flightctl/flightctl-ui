import * as React from 'react';

import { DeviceIntegrityStatusSummaryType } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import StatusDisplay from './StatusDisplay';
import { getIntegrityStatusItems } from '../../utils/status/integrity';

const IntegrityStatus = ({ status }: { status?: DeviceIntegrityStatusSummaryType }) => {
  const { t } = useTranslation();

  const statusItems = getIntegrityStatusItems(t);

  const item = statusItems.find((statusItem) => {
    return statusItem.id === status;
  });
  return <StatusDisplay item={item} />;
};

export default IntegrityStatus;
