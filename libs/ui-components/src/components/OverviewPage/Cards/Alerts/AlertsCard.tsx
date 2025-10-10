import * as React from 'react';
import {
  Alert,
  Card,
  CardBody,
  CardTitle,
  Icon,
  List,
  ListItem,
  Stack,
  StackItem,
  TextContent,
} from '@patternfly/react-core';
import { TFunction } from 'react-i18next';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import { ResourceKind } from '@flightctl/types';
import { AlertManagerAlert } from '../../../../types/extraTypes';
import { useFetchPeriodically } from '../../../../hooks/useFetchPeriodically';
import { useTranslation } from '../../../../hooks/useTranslation';
import { getDateDisplay } from '../../../../utils/dates';
import { getErrorMessage } from '../../../../utils/error';
import ResourceLink from '../../../common/ResourceLink';

import AlertsEmptyState from './AlertsEmptyState';

const ALERTS_TIMEOUT = 20000; // 20 seconds

// Define only the Event.reason values that correspond to alerts
type AlertEventReason =
  | 'DeviceApplicationDegraded'
  | 'DeviceApplicationError'
  | 'DeviceApplicationHealthy'
  | 'DeviceCPUCritical'
  | 'DeviceCPUNormal'
  | 'DeviceCPUWarning'
  | 'DeviceMemoryCritical'
  | 'DeviceMemoryNormal'
  | 'DeviceMemoryWarning'
  | 'DeviceDiskCritical'
  | 'DeviceDiskNormal'
  | 'DeviceDiskWarning'
  | 'DeviceConnected'
  | 'DeviceDisconnected'
  | 'ResourceDeleted'
  | 'DeviceDecommissioned';

// Alert types that are processed by the alert exporter
const getAlertTitles = (t: (key: string) => string): Record<AlertEventReason, string> => ({
  // Application status alerts
  DeviceApplicationDegraded: t('Some application workloads are degraded'),
  DeviceApplicationError: t('Some application workloads are in error state'),
  DeviceApplicationHealthy: t('All application workloads are healthy'),
  // CPU alerts
  DeviceCPUCritical: t('CPU utilization has reached a critical level'),
  DeviceCPUNormal: t('CPU utilization has returned to normal'),
  DeviceCPUWarning: t('CPU utilization has reached a warning level'),
  // Memory alerts
  DeviceMemoryCritical: t('Memory utilization has reached a critical level'),
  DeviceMemoryNormal: t('Memory utilization has returned to normal'),
  DeviceMemoryWarning: t('Memory utilization has reached a warning level'),
  // Disk alerts
  DeviceDiskCritical: t('Disk utilization has reached a critical level'),
  DeviceDiskNormal: t('Disk utilization has returned to normal'),
  DeviceDiskWarning: t('Disk utilization has reached a warning level'),
  // Other device-specific alerts
  DeviceConnected: t('Device reconnected'),
  DeviceDisconnected: t('Device is disconnected'),
  DeviceDecommissioned: t('Device decommissioned successfully'),
  // Resource lifecycle alerts
  ResourceDeleted: t('Resource was deleted successfully'),
});

const alertResourceKind: Record<AlertEventReason, ResourceKind | undefined> = {
  // Application status alerts
  DeviceApplicationDegraded: ResourceKind.Device,
  DeviceApplicationError: ResourceKind.Device,
  DeviceApplicationHealthy: ResourceKind.Device,
  // CPU alerts
  DeviceCPUCritical: ResourceKind.Device,
  DeviceCPUNormal: ResourceKind.Device,
  DeviceCPUWarning: ResourceKind.Device,
  // Memory alerts
  DeviceMemoryCritical: ResourceKind.Device,
  DeviceMemoryNormal: ResourceKind.Device,
  DeviceMemoryWarning: ResourceKind.Device,
  // Disk alerts
  DeviceDiskCritical: ResourceKind.Device,
  DeviceDiskNormal: ResourceKind.Device,
  DeviceDiskWarning: ResourceKind.Device,
  // Other device-specific alerts
  DeviceConnected: ResourceKind.Device,
  DeviceDisconnected: ResourceKind.Device,
  DeviceDecommissioned: ResourceKind.Device,
  // Resource lifecycle alerts
  ResourceDeleted: undefined,
};

const resourceKindLabel = (t: TFunction, resourceKind: ResourceKind | undefined) => {
  switch (resourceKind) {
    case undefined:
      return t('Resource');
    case ResourceKind.Device:
      return t('Device');
    case ResourceKind.EnrollmentRequest:
      return t('Enrollment request');
    case ResourceKind.CertificateSigningRequest:
      return t('Certificate signing request');
    case ResourceKind.Fleet:
      return t('Fleet');
    case ResourceKind.Repository:
      return t('Repository');
    case ResourceKind.ResourceSync:
      return t('Resource sync');
    case ResourceKind.TemplateVersion:
      return t('Template version');
  }
};
const getAlertTitle = (alert: AlertManagerAlert, defaultTitle: string) => {
  if (alert.annotations.summary) {
    return alert.annotations.summary;
  }
  return defaultTitle;
};

const AlertsCard = () => {
  const { t } = useTranslation();

  const [alerts, isLoading, error] = useFetchPeriodically<AlertManagerAlert[]>({
    endpoint: 'alerts',
    timeout: ALERTS_TIMEOUT,
  });

  const alertTypes = React.useMemo(() => getAlertTitles(t), [t]);

  let alertsBody: React.ReactNode;
  if (isLoading) {
    alertsBody = <CardBody>{t('Loading alerts...')}</CardBody>;
  } else if (error) {
    alertsBody = (
      <CardBody>
        <Alert variant="danger" title={t('Error loading alerts')}>
          {getErrorMessage(error)}
        </Alert>
      </CardBody>
    );
  } else if (alerts?.length === 0) {
    alertsBody = <AlertsEmptyState />;
  } else {
    alertsBody = (
      <List isPlain>
        {alerts?.map((alert) => {
          const alertName = alert.labels.alertname as AlertEventReason;
          const resourceKind = alertResourceKind[alertName];
          const kindLabel = resourceKindLabel(t, resourceKind);
          return (
            <ListItem key={alert.fingerprint}>
              <Stack>
                <StackItem>
                  <Icon status="danger" size="md">
                    <ExclamationCircleIcon />
                  </Icon>{' '}
                  <strong>{getAlertTitle(alert, alertTypes[alertName] || alertName)}</strong>
                </StackItem>
                <StackItem>
                  <TextContent>
                    {kindLabel}{' '}
                    {resourceKind === ResourceKind.Device ? (
                      <ResourceLink id={alert.labels.resource} />
                    ) : (
                      alert.labels.resource
                    )}
                  </TextContent>
                </StackItem>
                <StackItem>
                  <TextContent>
                    <small>{getDateDisplay(alert.startsAt || '')}</small>
                  </TextContent>
                </StackItem>
              </Stack>
            </ListItem>
          );
        })}
      </List>
    );
  }

  return (
    <Card>
      <CardTitle>{t('Alerts')}</CardTitle>
      <CardBody>{alertsBody}</CardBody>
    </Card>
  );
};

export default AlertsCard;
