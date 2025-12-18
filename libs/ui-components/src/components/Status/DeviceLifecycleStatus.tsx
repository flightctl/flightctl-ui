import * as React from 'react';
import disabledColor/* CODEMODS: you should update this color token, original v5 token was global_disabled_color_100 */ from "@patternfly/react-tokens/dist/js/t_temp_dev_tbd";

import { Device, DeviceLifecycleStatusType } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { getDeviceLifecycleStatus, getDeviceLifecycleStatusItems } from '../../utils/status/devices';
import StatusDisplay, { StatusDisplayContent } from './StatusDisplay';

const DeviceLifecycleStatus = ({ device }: { device: Device }) => {
  const { t } = useTranslation();

  const status = getDeviceLifecycleStatus(device);
  const statusItems = getDeviceLifecycleStatusItems(t);

  const item = statusItems.find((statusItem) => {
    return statusItem.id === status;
  });

  if (item?.id === DeviceLifecycleStatusType.DeviceLifecycleStatusDecommissioned) {
    // TODO The decommissioned status appears as disabled. Could there be a message associated to it? It would look weird (disabled with a link)
    return (
      <StatusDisplayContent
        level={item.level}
        customIcon={item.customIcon}
        label={<span style={{ color: disabledColor.value }}>{item.label}</span>}
      />
    );
  }

  return <StatusDisplay item={item} message={device.status?.lifecycle.info} />;
};

export default DeviceLifecycleStatus;
