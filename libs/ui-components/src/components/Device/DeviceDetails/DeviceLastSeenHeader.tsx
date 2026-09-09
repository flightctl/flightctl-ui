import * as React from 'react';
import { Content } from '@patternfly/react-core';

import { type Device, type DeviceLastSeen } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { timeSinceText } from '../../../utils/dates';

const LAST_SEEN_REFRESH_INTERVAL = 60 * 1000;

const DeviceLastSeenHeader = ({ device }: { device: Required<Device> }) => {
  const { t } = useTranslation();
  const [lastSeenResponse] = useFetchPeriodically<DeviceLastSeen>({
    endpoint: `devices/${device.metadata.name}/lastseen`,
    timeout: LAST_SEEN_REFRESH_INTERVAL,
  });

  return <Content>{t('Last seen {{time}}', { time: timeSinceText(t, lastSeenResponse?.lastSeen) })}</Content>;
};

export default DeviceLastSeenHeader;
