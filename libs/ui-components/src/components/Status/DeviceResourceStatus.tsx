import * as React from 'react';

import { useTranslation } from '../../hooks/useTranslation';
import { StatusLevel, getDefaultStatusIcon } from '../../utils/status/common';
import { StatusDisplayContent } from './StatusDisplay';
import { DeviceResourceStatusType } from '@flightctl/types';

const DeviceResourceStatus = ({ status }: { status: DeviceResourceStatusType | undefined }) => {
  const { t } = useTranslation();

  let level: StatusLevel;
  switch (status) {
    case DeviceResourceStatusType.DeviceResourceStatusHealthy:
      level = 'success';
      break;
    case DeviceResourceStatusType.DeviceResourceStatusWarning:
      level = 'warning';
      break;
    case DeviceResourceStatusType.DeviceResourceStatusCritical:
    case DeviceResourceStatusType.DeviceResourceStatusError:
      level = 'danger';
      break;
    case DeviceResourceStatusType.DeviceResourceStatusUnknown:
    case undefined:
      level = 'unknown';
      break;
  }
  const IconComponent = getDefaultStatusIcon(level);
  return <StatusDisplayContent level={level} icon={<IconComponent />} label={status || t('Unknown')} />;
};

export default DeviceResourceStatus;
