import * as React from 'react';
import { DescriptionList } from '@patternfly/react-core';

import { type Device } from '@flightctl/types';
import { useTranslation } from '../../../../hooks/useTranslation';
import { getAppSummaryStatusLevel } from '../../../../utils/status/applications';
import { getDeviceSummaryStatusLevel } from '../../../../utils/status/devices';
import { getIntegrityStatusLevel } from '../../../../utils/status/integrity';
import { getSystemUpdateStatusLevel } from '../../../../utils/status/system';
import LabelWithHelperText from '../../../common/WithHelperText';
import ApplicationSummaryStatus from '../../../Status/ApplicationSummaryStatus';
import DeviceStatus from '../../../Status/DeviceStatus';
import SystemUpdateStatus from '../../../Status/SystemUpdateStatus';
import IntegrityStatus from '../../../Status/IntegrityStatus';
import DeviceDetailsStatusAccent from '../DeviceDetailsStatusAccent';

type StatusContentProps = {
  device: Required<Device>;
};

const StatusContent = ({ device }: StatusContentProps) => {
  const { t } = useTranslation();

  const appStatus = device.status?.applicationsSummary;
  const deviceStatus = device.status?.summary;
  const updateStatus = device.status?.updated;
  const integrityStatus = device.status?.integrity;

  return (
    <DescriptionList isCompact className="fctl-device-status-fields">
      <DeviceDetailsStatusAccent
        statusLabel={
          <LabelWithHelperText
            label={t('Application status')}
            content={t('Indicates the overall status of application workloads on the device.')}
            isInline
          />
        }
        statusContent={<ApplicationSummaryStatus statusSummary={appStatus} />}
        level={getAppSummaryStatusLevel(appStatus?.status)}
      />
      <DeviceDetailsStatusAccent
        statusLabel={
          <LabelWithHelperText
            label={t('Device status')}
            content={t('Indicates the overall status of the device hardware and operating system.')}
            isInline
          />
        }
        statusContent={<DeviceStatus summaryStatus={deviceStatus} />}
        level={getDeviceSummaryStatusLevel(deviceStatus?.status)}
      />
      <DeviceDetailsStatusAccent
        statusLabel={
          <LabelWithHelperText
            label={t('Update status')}
            content={t(
              'Indicates whether a system is running the latest target configuration or is updating towards it.',
            )}
            isInline
          />
        }
        statusContent={<SystemUpdateStatus updateStatus={updateStatus} />}
        level={getSystemUpdateStatusLevel(updateStatus?.status)}
      />

      <DeviceDetailsStatusAccent
        statusLabel={
          <LabelWithHelperText
            label={t('Integrity status')}
            content={t('Indicates whether the device has been verified as secure and authentic.')}
            isInline
          />
        }
        statusContent={<IntegrityStatus integrityStatus={integrityStatus} />}
        level={getIntegrityStatusLevel(integrityStatus?.status)}
      />
    </DescriptionList>
  );
};

export default StatusContent;
