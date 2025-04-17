import * as React from 'react';
import { TFunction } from 'react-i18next';

import {
  Device,
  DeviceResourceStatus,
  DeviceResourceStatusType,
  ResourceAlertSeverityType,
  ResourceMonitorSpec,
} from '@flightctl/types';

import { useTranslation } from '../../hooks/useTranslation';
import { StatusLevel } from '../../utils/status/common';
import { StatusDisplayContent } from './StatusDisplay';

type MonitorType = keyof DeviceResourceStatus; /* cpu / disk / memory */

const getMonitorTypeLabel = (monitorType: MonitorType, t: TFunction) => {
  switch (monitorType) {
    case 'cpu':
      return t('CPU');
    case 'memory':
      return t('Memory');
    case 'disk':
      return t('Disk');
  }
};

const getTriggeredResourceAlert = (
  resourcesInfo: Array<ResourceMonitorSpec>,
  monitorType: MonitorType,
  monitorStatus?: DeviceResourceStatusType,
) => {
  if (
    !monitorStatus ||
    [
      DeviceResourceStatusType.DeviceResourceStatusHealthy,
      DeviceResourceStatusType.DeviceResourceStatusUnknown,
    ].includes(monitorStatus)
  ) {
    return null;
  }
  const monitorDetails = resourcesInfo.find(
    (item) => item.monitorType.toLowerCase() === monitorType.toLowerCase() && item.alertRules.length > 0,
  );
  if (!monitorDetails) {
    return null;
  }

  // Attempt to find the rule matching exactly the monitor's status
  return monitorDetails.alertRules.find((alertRule) => {
    switch (monitorStatus) {
      case DeviceResourceStatusType.DeviceResourceStatusWarning:
        return alertRule.severity === ResourceAlertSeverityType.ResourceAlertSeverityTypeWarning;
      case DeviceResourceStatusType.DeviceResourceStatusCritical:
        return alertRule.severity === ResourceAlertSeverityType.ResourceAlertSeverityTypeCritical;
    }
    return false;
  });
};

const DeviceResourceStatus = ({ device, monitorType }: { device: Device | undefined; monitorType: MonitorType }) => {
  const { t } = useTranslation();

  if (!device) {
    return <StatusDisplayContent level="unknown" label={t('Unknown')} />;
  }

  let level: StatusLevel;
  let label: string;
  let messageTitle: string = '';
  const status = device.status?.resources[monitorType];
  const triggeredAlert = getTriggeredResourceAlert(device.spec?.resources ?? [], monitorType, status);

  if (triggeredAlert) {
    label = t('Past threshold ({{ percent }}%)', { percent: triggeredAlert.percentage });
    messageTitle = t('{{ monitorType }} pressure - {{ status }}', {
      monitorType: getMonitorTypeLabel(monitorType, t),
      status,
    }); // eg CPU pressure - critical
  } else if (status === DeviceResourceStatusType.DeviceResourceStatusHealthy) {
    label = t('Within limits');
  } else {
    label = status || t('Unknown');
  }

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

  return (
    <StatusDisplayContent
      level={level}
      label={label}
      messageTitle={messageTitle}
      message={triggeredAlert?.description}
    />
  );
};

export default DeviceResourceStatus;
