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

const resourceTypeOrder = [
  ResourceAlertSeverityType.ResourceAlertSeverityTypeCritical,
  ResourceAlertSeverityType.ResourceAlertSeverityTypeWarning,
  ResourceAlertSeverityType.ResourceAlertSeverityTypeInfo,
];

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

const getResourceErrorDetails = (resourcesInfo: Array<ResourceMonitorSpec>, monitorType: MonitorType) => {
  const monitorDetails = resourcesInfo.find((item) => item.monitorType === monitorType && item.alertRules.length > 0);
  if (!monitorDetails) {
    return null;
  }
  const highestSeverityRule = monitorDetails.alertRules
    .filter((rule) => rule.severity !== ResourceAlertSeverityType.ResourceAlertSeverityTypeInfo)
    .sort((a, b) => {
      const aIndex = resourceTypeOrder.indexOf(a.severity);
      const bIndex = resourceTypeOrder.indexOf(b.severity);
      return aIndex - bIndex;
    });
  return highestSeverityRule.length > 0 ? highestSeverityRule[0] : null;
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
  const errorDetails = getResourceErrorDetails(device.spec?.resources ?? [], monitorType);

  if (errorDetails) {
    label = t('Past threshold ({{ percent }}%)', { percent: errorDetails.percentage });
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
    <StatusDisplayContent level={level} label={label} messageTitle={messageTitle} message={errorDetails?.description} />
  );
};

export default DeviceResourceStatus;
