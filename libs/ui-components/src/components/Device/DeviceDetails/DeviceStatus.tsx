import * as React from 'react';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { DisconnectedIcon } from '@patternfly/react-icons/dist/js/icons/disconnected-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';

import { Device } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { DeviceConditionStatus, deviceStatusLabels, getDeviceStatus } from '../../../utils/status/device';
import StatusLabel, { StatusLabelColor } from '../../common/StatusLabel';

const DeviceStatus = ({ device }: { device?: Device }) => {
  const status = device ? getDeviceStatus(device) : DeviceConditionStatus.Approved;
  const { t } = useTranslation();
  const statusLabels = deviceStatusLabels(t);

  let labelStatus: StatusLabelColor;
  let icon: React.ReactNode;

  switch (status) {
    case DeviceConditionStatus.Valid:
    case DeviceConditionStatus.Approved:
    case DeviceConditionStatus.Available:
      labelStatus = 'success';
      icon = <CheckCircleIcon />;
      break;
    case DeviceConditionStatus.Progressing:
      labelStatus = 'info';
      icon = <InProgressIcon />;
      break;
    case DeviceConditionStatus.Degraded:
      labelStatus = 'warning';
      icon = <ExclamationTriangleIcon />;
      break;
    case DeviceConditionStatus.Unavailable:
      labelStatus = 'warning';
      icon = <DisconnectedIcon />;
      break;
  }

  return <StatusLabel label={statusLabels[status]} status={labelStatus || 'unknown'} icon={icon} />;
};

export default DeviceStatus;
