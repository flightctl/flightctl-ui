import * as React from 'react';
import { Label, LabelProps } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';

import { DeviceConditionStatus, getDeviceStatus } from '../../../utils/status/device';
import { Device } from '@flightctl/types';

// TODO https://issues.redhat.com/browse/MGMT-17658 Statuses need translations (for devices, fleets, etc)
export const ApprovedStatus = () => (
  <Label color="green" icon={<CheckCircleIcon />}>
    Approved
  </Label>
);

const DeviceStatus = ({ device }: { device?: Device }) => {
  const status = device ? getDeviceStatus(device) : DeviceConditionStatus.Approved;
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
