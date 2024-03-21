import * as React from 'react';
import { Label, LabelProps } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';

import { DeviceConditionStatus, getDeviceStatus } from '@app/utils/status/device';
import { Device } from '@types';

const DeviceStatus = ({ device }: { device?: Device }) => {
  const status = device ? getDeviceStatus(device) : DeviceConditionStatus.Approved;
  let color: LabelProps['color'] = 'green';
  let icon;

  switch (status) {
    case DeviceConditionStatus.Valid:
    case DeviceConditionStatus.Approved:
    case DeviceConditionStatus.Available:
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
      color = 'red';
      icon = <ExclamationCircleIcon />;
      break;
  }

  return (
    <Label color={color} icon={icon}>
      {status}
    </Label>
  );
};

export default DeviceStatus;
