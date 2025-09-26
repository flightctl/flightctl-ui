import * as React from 'react';
import { Alert } from '@patternfly/react-core';

import { useAppContext } from '../../hooks/useAppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { getBrandName } from '../../utils/brand';

interface PendingSyncDevicesAlertProps {
  forSingleDevice?: boolean;
}

export const PendingSyncDevicesAlert = ({ forSingleDevice }: PendingSyncDevicesAlertProps) => {
  const { t } = useTranslation();
  const { settings } = useAppContext();

  const getMessage = () => {
    if (forSingleDevice) {
      return t(
        '{{ brandName }} is waiting for the device to connect and report its status. It will report a ʼPending syncʼ status until it is able to reconnect. If it has configuration conflicts, it will report a ʼSuspendedʼ status and require manual action to resume.',
        { brandName: getBrandName(settings) },
      );
    }

    return t(
      '{{ brandName }} is waiting for devices to connect and report their status. Devices will report a ʼPending syncʼ status until they are able to connect. Devices with configuration conflicts will report a ʼSuspendedʼ status and require manual action to resume.',
      { brandName: getBrandName(settings) },
    );
  };

  return (
    <Alert variant="warning" isInline title={t('System recovery complete')}>
      {getMessage()}
    </Alert>
  );
};
