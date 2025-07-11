import * as React from 'react';
import { TFunction } from 'react-i18next';

import { Event, EventList, ObjectReference, ResourceKind } from '@flightctl/types';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { EVENT_PAGE_SIZE } from '../../constants';
import { getDateDisplay } from '../../utils/dates';
import * as queryUtils from '../../utils/query';

const getTimeout = (kind?: ResourceKind) => {
  switch (kind) {
    case ResourceKind.DEVICE:
      return 180000; // 3 minutes
    case ResourceKind.FLEET:
      return 300000; // 5 minutes
    case ResourceKind.REPOSITORY:
    default:
      return 600000; // 10 minutes
  }
};

type UseEventsResult = [
  DisplayEvent[] | undefined, // Event list
  boolean, // isLoading
  VoidFunction, // refetch
  boolean, // isUpdating
  number, // Last update timestamp
];

export type SelectableEventType = Event.type | 'all';

// Reduced Event object. All fields should be ready to be displayed in the UI.
export type DisplayEvent = Pick<Event, 'type' | 'message'> & {
  name: string;
  dateText: string;
  reasonText: string;
};

export type EventSearchCriteria = Partial<ObjectReference> & {
  type: SelectableEventType;
};

const getEventReasonTitles = (t: TFunction, kindType: string): Record<Event.reason, string> => {
  const params = { resourceType: kindType };
  return {
    // Generic resource events
    [Event.reason.RESOURCE_CREATED]: t('{{ resourceType }} was created successfully', params),
    [Event.reason.RESOURCE_CREATION_FAILED]: t('{{ resourceType }} could not be created', params),
    [Event.reason.RESOURCE_DELETED]: t('{{ resourceType }} was deleted successfully', params),
    [Event.reason.RESOURCE_DELETION_FAILED]: t('{{ resourceType }} could not be deleted', params),
    [Event.reason.RESOURCE_UPDATED]: t('{{ resourceType }} was updated successfully', params),
    [Event.reason.RESOURCE_UPDATE_FAILED]: t('{{ resourceType }} could not be updated', params),
    [Event.reason.GIT_RESOURCE_CHANGE_DETECTED]: t('Git resource change detected', params),
    // Device events
    [Event.reason.DEVICE_DECOMMISSIONED]: t('Device decommissioned successfully'),
    [Event.reason.DEVICE_DECOMMISSION_FAILED]: t('Device could not be decommissioned'),
    [Event.reason.DEVICE_CPUNORMAL]: t('CPU utilization has returned to normal'),
    [Event.reason.DEVICE_CPUWARNING]: t('CPU utilization has reached a warning level'),
    [Event.reason.DEVICE_CPUCRITICAL]: t('CPU utilization has reached a critical level'),
    [Event.reason.DEVICE_MEMORY_NORMAL]: t('Memory utilization has returned to normal'),
    [Event.reason.DEVICE_MEMORY_WARNING]: t('Memory utilization has reached a warning level'),
    [Event.reason.DEVICE_MEMORY_CRITICAL]: t('Memory utilization has reached a critical level'),
    [Event.reason.DEVICE_DISK_NORMAL]: t('Disk utilization has returned to normal'),
    [Event.reason.DEVICE_DISK_WARNING]: t('Disk utilization has reached a warning level'),
    [Event.reason.DEVICE_DISK_CRITICAL]: t('Disk utilization has reached a critical level'),
    [Event.reason.DEVICE_APPLICATION_HEALTHY]: t('All application workloads are healthy'),
    [Event.reason.DEVICE_APPLICATION_DEGRADED]: t('Some applications workloads are degraded'),
    [Event.reason.DEVICE_APPLICATION_ERROR]: t('Some application workloads are in error state'),
    [Event.reason.DEVICE_CONNECTED]: t('Device reconnected'),
    [Event.reason.DEVICE_DISCONNECTED]: t('Device is disconnected'),
    [Event.reason.DEVICE_CONTENT_UP_TO_DATE]: t('Device returned to being up-to-date'),
    [Event.reason.DEVICE_CONTENT_UPDATING]: t('Device is updating'),
    [Event.reason.DEVICE_CONTENT_OUT_OF_DATE]: t('Device is out-of-date'),
    [Event.reason.DEVICE_MULTIPLE_OWNERS_DETECTED]: t('Detected device ownership conflict'),
    [Event.reason.DEVICE_MULTIPLE_OWNERS_RESOLVED]: t('Device ownership conflict has been resolved'),
    [Event.reason.DEVICE_SPEC_VALID]: t('Device specification has returned to a valid state'),
    [Event.reason.DEVICE_SPEC_INVALID]: t('Device specification is invalid'),
    [Event.reason.DEVICE_OWNERSHIP_CHANGED]: t('Device ownership changed'),
    // Enrollment request events
    [Event.reason.ENROLLMENT_REQUEST_APPROVED]: t('Enrollment request was approved'),
    [Event.reason.ENROLLMENT_REQUEST_APPROVAL_FAILED]: t('Enrollment request approval failed'),
    // Internal task events
    [Event.reason.INTERNAL_TASK_FAILED]: t('Internal task failed'),
    // Repository events
    [Event.reason.REPOSITORY_ACCESSIBLE]: t('Repository is accessible'),
    [Event.reason.REPOSITORY_INACCESSIBLE]: t('Repository is inaccessible'),
    // Fleet events
    [Event.reason.FLEET_SELECTOR_PROCESSING_COMPLETED]: t('Fleet selector processing completed'),
    [Event.reason.FLEET_RECONCILED]: t('Fleet reconciled'),
    [Event.reason.FLEET_RECONCILE_FAILED]: t('Fleet reconciliation failed'),
  };
};

const redundantMessageReasons = [
  Event.reason.RESOURCE_CREATED, // <kind> <name> created successfully
  Event.reason.RESOURCE_UPDATED, // <kind> <name> updated successfully
  Event.reason.RESOURCE_DELETED, // <kind> <name> deleted successfully
];

const displayEventMapper = (event: Event, reasonTxt: string): DisplayEvent => ({
  name: event.metadata.name as string,
  type: event.type,
  dateText: getDateDisplay(event.metadata.creationTimestamp || ''),
  reasonText: reasonTxt || event.reason,
  message: redundantMessageReasons.includes(event.reason) ? '' : event.message,
});

const buildEndpoint = (criteria: EventSearchCriteria) => {
  const params = new URLSearchParams({
    limit: `${EVENT_PAGE_SIZE}`,
  });
  const fieldSelectors: string[] = [];
  if (criteria.kind) {
    queryUtils.addQueryConditions(fieldSelectors, 'involvedObject.kind', [criteria.kind]);
  }
  if (criteria.name) {
    queryUtils.addQueryConditions(fieldSelectors, 'involvedObject.name', [criteria.name]);
  }
  if (criteria.type !== 'all') {
    queryUtils.addQueryConditions(fieldSelectors, 'type', [criteria.type]);
  }

  if (fieldSelectors.length > 0) {
    params.set('fieldSelector', fieldSelectors.join(','));
  }
  return `events?${params.toString()}`;
};

const useEvents = (criteria: EventSearchCriteria, t: TFunction): UseEventsResult => {
  const [events, setEvents] = React.useState<DisplayEvent[]>();
  const [lastDate, setLastDate] = React.useState<number>(0);
  const timeout = getTimeout(criteria.kind as ResourceKind | undefined);

  const [eventList, isLoading, , refetch, isUpdating] = useFetchPeriodically<EventList>({
    endpoint: buildEndpoint(criteria),
    timeout,
  });

  const eventReasonTitles = React.useMemo(() => {
    return getEventReasonTitles(t, criteria.kind || t('Resource'));
  }, [t, criteria.kind]);

  React.useEffect(() => {
    setEvents(() => {
      return (eventList?.items || []).map((event) => {
        const reason = eventReasonTitles[event.reason];
        return displayEventMapper(event, reason);
      });
    });
    setLastDate(Date.now());
  }, [criteria, eventList?.items, eventReasonTitles]);

  return [events, isLoading, refetch, isUpdating, lastDate];
};

export default useEvents;
