import * as React from 'react';

import { type DeviceStatus } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { StatusDisplayContent } from '../../Status/StatusDisplay';

const getBooleanValue = (value: string | boolean | undefined | null): boolean => {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  return value === 'true';
};

const DeviceDeltaUpdateDetails = ({ deviceStatus }: { deviceStatus?: DeviceStatus }) => {
  const { t } = useTranslation();

  const deltaEligible = getBooleanValue(deviceStatus?.systemInfo?.deltaEligible);
  const ociDeltaVersion = deviceStatus?.systemInfo?.ociDeltaVersion;

  if (deltaEligible !== true) {
    return <StatusDisplayContent level="info" label={t('Not eligible')} />;
  }

  if (!ociDeltaVersion) {
    return (
      <StatusDisplayContent level="warning" label={t('Device eligible for delta updates, but oci-delta not found')} />
    );
  }

  return <StatusDisplayContent level="success" label={t('Eligible')} />;
};

export default DeviceDeltaUpdateDetails;
