import * as React from 'react';
import { Label, LabelProps } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { DisconnectedIcon } from '@patternfly/react-icons/dist/js/icons/disconnected-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';

import { Device } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { DeviceConditionStatus, deviceStatusLabels, getDeviceStatus } from '../../../utils/status/device';

const DeviceStatus = ({ device }: { device?: Device }) => {
  const status = device ? getDeviceStatus(device) : DeviceConditionStatus.Approved;
  const { t } = useTranslation();
  const statusLabels = deviceStatusLabels(t);

  let color: LabelProps['color'];
  let icon: LabelProps['icon'];

  switch (status) {
    case DeviceConditionStatus.Valid:
    case DeviceConditionStatus.Approved:
    case DeviceConditionStatus.Available:
      color = 'green';
      icon = <CheckCircleIcon />;
      break;
    case DeviceConditionStatus.Progressing:
      color = 'blue';
      icon = <InProgressIcon />;
      break;
    case DeviceConditionStatus.Degraded:
      color = 'orange';
      icon = <ExclamationTriangleIcon />;
      break;
    case DeviceConditionStatus.Unavailable:
      color = 'orange';
      icon = <DisconnectedIcon />;
      break;
  }

  return (
    <Label color={color} icon={icon}>
      {statusLabels[status] || t('Unknown')}
    </Label>
  );
};

export default DeviceStatus;
