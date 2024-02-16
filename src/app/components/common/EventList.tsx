import * as React from 'react';
import { EmptyState, EmptyStateBody, Stack, StackItem } from '@patternfly/react-core';

import { AppEvent } from '@app/types/extraTypes';

import Event from './Event';

const events: AppEvent[] = [
  {
    title: 'Event 123',
    content: 'An enrollment request is pending approval',
    type: 'action',
    timestamp: '2024-02-02T11:23:47Z',
  },
  {
    title: 'Event 262',
    content: 'All devices have enrolled correctly',
    type: 'info',
    timestamp: '2024-01-30T08:05:12Z',
  },
  { title: 'Event 265', content: '3% of devices are degraded', type: 'error', timestamp: '2024-01-27T19:19:24Z' },
  { title: 'Event 605', content: 'The fleet has started updating', type: 'warning', timestamp: '2024-01-27T16:44:48Z' },
];

const EventList = (/* { events }: { events: SystemEvent[] } */) => {
  if (events.length === 0) {
    return (
      <EmptyState>
        <EmptyStateBody>No events exist for the selected criteria</EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <Stack hasGutter>
      {events.map((event, idx) => (
        <StackItem key={`${event.title}-${idx}`}>
          <Event event={event} />
        </StackItem>
      ))}
    </Stack>
  );
};

export default EventList;
