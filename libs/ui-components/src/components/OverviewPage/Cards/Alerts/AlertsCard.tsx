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

import { Event, ResourceKind } from '@flightctl/types';
import { useAlerts } from '../../../../hooks/useAlerts';
import { useTranslation } from '../../../../hooks/useTranslation';
import { getDateDisplay } from '../../../../utils/dates';
import { getErrorMessage } from '../../../../utils/error';
import ResourceLink from '../../../common/ResourceLink';

import AlertsEmptyState from './AlertsEmptyState';

// Define only the Event.reason values that correspond to alerts
type AlertEventReason =
  | Event.reason.DEVICE_APPLICATION_DEGRADED
  | Event.reason.DEVICE_APPLICATION_ERROR
  | Event.reason.DEVICE_APPLICATION_HEALTHY
  | Event.reason.DEVICE_CPUCRITICAL
  | Event.reason.DEVICE_CPUNORMAL
  | Event.reason.DEVICE_CPUWARNING
  | Event.reason.DEVICE_MEMORY_CRITICAL
  | Event.reason.DEVICE_MEMORY_NORMAL
  | Event.reason.DEVICE_MEMORY_WARNING
  | Event.reason.DEVICE_DISK_CRITICAL
  | Event.reason.DEVICE_DISK_NORMAL
  | Event.reason.DEVICE_DISK_WARNING
  | Event.reason.DEVICE_CONNECTED
  | Event.reason.DEVICE_DISCONNECTED
  | Event.reason.RESOURCE_DELETED
  | Event.reason.DEVICE_DECOMMISSIONED;

// Alert types that are processed by the alert exporter
const getAlertTitles = (t: (key: string) => string): Record<AlertEventReason, string> => ({
  // Application status alerts
  [Event.reason.DEVICE_APPLICATION_DEGRADED]: t('Some application workloads are degraded'),
  [Event.reason.DEVICE_APPLICATION_ERROR]: t('Some application workloads are in error state'),
  [Event.reason.DEVICE_APPLICATION_HEALTHY]: t('All application workloads are healthy'),
  // CPU alerts
  [Event.reason.DEVICE_CPUCRITICAL]: t('CPU utilization has reached a critical level'),
  [Event.reason.DEVICE_CPUNORMAL]: t('CPU utilization has returned to normal'),
  [Event.reason.DEVICE_CPUWARNING]: t('CPU utilization has reached a warning level'),
  // Memory alerts
  [Event.reason.DEVICE_MEMORY_CRITICAL]: t('Memory utilization has reached a critical level'),
  [Event.reason.DEVICE_MEMORY_NORMAL]: t('Memory utilization has returned to normal'),
  [Event.reason.DEVICE_MEMORY_WARNING]: t('Memory utilization has reached a warning level'),
  // Disk alerts
  [Event.reason.DEVICE_DISK_CRITICAL]: t('Disk utilization has reached a critical level'),
  [Event.reason.DEVICE_DISK_NORMAL]: t('Disk utilization has returned to normal'),
  [Event.reason.DEVICE_DISK_WARNING]: t('Disk utilization has reached a warning level'),
  // Other device-specific alerts
  [Event.reason.DEVICE_CONNECTED]: t('Device reconnected'),
  [Event.reason.DEVICE_DISCONNECTED]: t('Device is disconnected'),
  [Event.reason.DEVICE_DECOMMISSIONED]: t('Device decommissioned successfully'),
  // Resource lifecycle alerts
  [Event.reason.RESOURCE_DELETED]: t('Resource was deleted successfully'),
});

const alertResourceKind: Record<AlertEventReason, ResourceKind | undefined> = {
  // Application status alerts
  [Event.reason.DEVICE_APPLICATION_DEGRADED]: ResourceKind.DEVICE,
  [Event.reason.DEVICE_APPLICATION_ERROR]: ResourceKind.DEVICE,
  [Event.reason.DEVICE_APPLICATION_HEALTHY]: ResourceKind.DEVICE,
  // CPU alerts
  [Event.reason.DEVICE_CPUCRITICAL]: ResourceKind.DEVICE,
  [Event.reason.DEVICE_CPUNORMAL]: ResourceKind.DEVICE,
  [Event.reason.DEVICE_CPUWARNING]: ResourceKind.DEVICE,
  // Memory alerts
  [Event.reason.DEVICE_MEMORY_CRITICAL]: ResourceKind.DEVICE,
  [Event.reason.DEVICE_MEMORY_NORMAL]: ResourceKind.DEVICE,
  [Event.reason.DEVICE_MEMORY_WARNING]: ResourceKind.DEVICE,
  // Disk alerts
  [Event.reason.DEVICE_DISK_CRITICAL]: ResourceKind.DEVICE,
  [Event.reason.DEVICE_DISK_NORMAL]: ResourceKind.DEVICE,
  [Event.reason.DEVICE_DISK_WARNING]: ResourceKind.DEVICE,
  // Other device-specific alerts
  [Event.reason.DEVICE_CONNECTED]: ResourceKind.DEVICE,
  [Event.reason.DEVICE_DISCONNECTED]: ResourceKind.DEVICE,
  [Event.reason.DEVICE_DECOMMISSIONED]: ResourceKind.DEVICE,
  // Resource lifecycle alerts
  [Event.reason.RESOURCE_DELETED]: undefined,
};

const resourceKindLabel = (t: TFunction, resourceKind: ResourceKind | undefined) => {
  switch (resourceKind) {
    case undefined:
      return t('Resource');
    case ResourceKind.DEVICE:
      return t('Device');
    case ResourceKind.ENROLLMENT_REQUEST:
      return t('Enrollment request');
    case ResourceKind.CERTIFICATE_SIGNING_REQUEST:
      return t('Certificate signing request');
    case ResourceKind.FLEET:
      return t('Fleet');
    case ResourceKind.REPOSITORY:
      return t('Repository');
    case ResourceKind.RESOURCE_SYNC:
      return t('Resource sync');
    case ResourceKind.TEMPLATE_VERSION:
      return t('Template version');
  }
};

const AlertsCard = () => {
  const { t } = useTranslation();
  const [alerts, isLoading, error] = useAlerts();
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
  } else if (alerts.length === 0) {
    alertsBody = <AlertsEmptyState />;
  } else {
    alertsBody = (
      <List isPlain>
        {alerts.map((alert) => {
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
                  <strong>{alertTypes[alertName] || alertName}</strong>
                </StackItem>
                <StackItem>
                  <TextContent>
                    {kindLabel}{' '}
                    {resourceKind === ResourceKind.DEVICE ? (
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
