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
    [Event.reason.RESOURCE_CREATED]: t('{{ resourceType }} was created successfully', params),
    [Event.reason.RESOURCE_CREATION_FAILED]: t('{{ resourceType }} could not be created', params),
    [Event.reason.RESOURCE_DELETED]: t('{{ resourceType }} was deleted successfully', params),
    [Event.reason.RESOURCE_DELETION_FAILED]: t('{{ resourceType }} could not be deleted', params),
    [Event.reason.RESOURCE_UPDATED]: t('{{ resourceType }} was updated successfully', params),
    [Event.reason.RESOURCE_UPDATE_FAILED]: t('{{ resourceType }} could not be updated', params),
    [Event.reason.RESOURCE_DECOMMISSIONED]: t('{{ resourceType }} was decommissioned successfully', params),
    [Event.reason.RESOURCE_DECOMMISSION_FAILED]: t('{{ resourceType }} could not be decommissioned', params),
  };
};

const redundantMessageReasons = [
  Event.reason.RESOURCE_CREATED, // <kind> <name> created successfully
  Event.reason.RESOURCE_UPDATED, // <kind> <name> updated successfully
  Event.reason.RESOURCE_DELETED, // <kind> <name> deleted successfully
  Event.reason.RESOURCE_DECOMMISSIONED, // <kind> <name> decommissioned successfully
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
