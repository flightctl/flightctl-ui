import * as React from 'react';
import { TFunction } from 'react-i18next';

import { Event, EventList, ObjectReference, ResourceKind } from '@flightctl/types';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { EVENT_PAGE_SIZE } from '../../constants';
import { getDateDisplay } from '../../utils/dates';
import * as queryUtils from '../../utils/query';

const getTimeout = (kind?: ResourceKind) => {
  switch (kind) {
    case ResourceKind.Device:
      return 180000; // 3 minutes
    case ResourceKind.Fleet:
      return 300000; // 5 minutes
    case ResourceKind.Repository:
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

export type SelectableEventType = Event['type'] | 'All';

// Reduced Event object. All fields should be ready to be displayed in the UI.
export type DisplayEvent = Pick<Event, 'type' | 'message'> & {
  name: string;
  dateText: string;
  reasonText: string;
};

export type EventSearchCriteria = Partial<ObjectReference> & {
  type: SelectableEventType;
};

const getEventReasonTitles = (t: TFunction, kindType: string): Record<Event['reason'], string> => {
  const params = { resourceType: kindType };
  return {
    // Generic resource events
    ResourceCreated: t('{{ resourceType }} was created successfully', params),
    ResourceCreationFailed: t('{{ resourceType }} could not be created', params),
    ResourceDeleted: t('{{ resourceType }} was deleted successfully', params),
    ResourceDeletionFailed: t('{{ resourceType }} could not be deleted', params),
    ResourceUpdated: t('{{ resourceType }} was updated successfully', params),
    ResourceUpdateFailed: t('{{ resourceType }} could not be updated', params),
    SystemRestored: t('The system was restored from a backup'),
    // Device events
    DeviceDecommissioned: t('Device decommissioned successfully'),
    DeviceDecommissionFailed: t('Device could not be decommissioned'),
    DeviceCPUNormal: t('CPU utilization has returned to normal'),
    DeviceCPUWarning: t('CPU utilization has reached a warning level'),
    DeviceCPUCritical: t('CPU utilization has reached a critical level'),
    DeviceMemoryNormal: t('Memory utilization has returned to normal'),
    DeviceMemoryWarning: t('Memory utilization has reached a warning level'),
    DeviceMemoryCritical: t('Memory utilization has reached a critical level'),
    DeviceDiskNormal: t('Disk utilization has returned to normal'),
    DeviceDiskWarning: t('Disk utilization has reached a warning level'),
    DeviceDiskCritical: t('Disk utilization has reached a critical level'),
    DeviceApplicationHealthy: t('All application workloads are healthy'),
    DeviceApplicationDegraded: t('Some applications workloads are degraded'),
    DeviceApplicationError: t('Some application workloads are in error state'),
    DeviceConnected: t('Device reconnected'),
    DeviceDisconnected: t('Device is disconnected'),
    DeviceIsRebooting: t('Device is rebooting'),
    DeviceContentUpToDate: t('Device returned to being up-to-date'),
    DeviceContentUpdating: t('Device is updating'),
    DeviceContentOutOfDate: t('Device is out-of-date'),
    DeviceUpdateFailed: t('Device update failed'),
    DeviceMultipleOwnersDetected: t('Detected device ownership conflict'),
    DeviceMultipleOwnersResolved: t('Device ownership conflict has been resolved'),
    DeviceSpecValid: t('Device specification has returned to a valid state'),
    DeviceSpecInvalid: t('Device specification is invalid'),
    DeviceConflictPaused: t('Device is paused after database restore'),
    DeviceConflictResolved: t('Device conflict has been resolved'),
    // Enrollment request events
    EnrollmentRequestApproved: t('Enrollment request was approved'),
    EnrollmentRequestApprovalFailed: t('Enrollment request approval failed'),
    // Internal task events
    InternalTaskFailed: t('Internal task failed'),
    InternalTaskPermanentlyFailed: t('Internal task permanently failed'),
    // Repository events
    RepositoryAccessible: t('Repository is accessible'),
    RepositoryInaccessible: t('Repository is inaccessible'),
    ReferencedRepositoryUpdated: t('Referenced repository was updated'),
    // Fleet events
    FleetValid: t('Fleet specification is valid'),
    FleetInvalid: t('Fleet specification is invalid'),
    FleetRolloutStarted: t('Fleet rollout started'),
    FleetRolloutCreated: t('Fleet rollout created'),
    FleetRolloutFailed: t('Fleet rollout failed'),
    FleetRolloutCompleted: t('Fleet rollout completed'),
    FleetRolloutBatchDispatched: t('Fleet rollout batch dispatched'),
    FleetRolloutDeviceSelected: t('Fleet rollout device selected'),
    FleetRolloutBatchCompleted: t('Fleet rollout batch completed'),
    // Resource sync events
    ResourceSyncSynced: t('Resourcesync synchronization completed', params),
    ResourceSyncSyncFailed: t('Resourcesync synchronization failed', params),
    ResourceSyncParsed: t('Resourcesync parsed successfully', params),
    ResourceSyncParsingFailed: t('Resourcesync parsing failed', params),
    ResourceSyncAccessible: t('Resourcesync is accessible', params),
    ResourceSyncInaccessible: t('Resourcesync is not accessible', params),
    ResourceSyncCommitDetected: t('Resourcesync new commit detected', params),
  };
};

const redundantMessageReasons: Event['reason'][] = [
  'ResourceCreated', // <kind> <name> created successfully
  'ResourceUpdated', // <kind> <name> updated successfully
  'ResourceDeleted', // <kind> <name> deleted successfully
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
  if (criteria.type !== 'All') {
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
