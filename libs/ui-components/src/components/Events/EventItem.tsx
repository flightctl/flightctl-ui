import * as React from 'react';
import { Icon, Stack, StackItem } from '@patternfly/react-core';
import InfoCircleIcon from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

import { Event } from '@flightctl/types';
import { DisplayEvent } from './useEvents';

const NormalEventIcon = () => (
  <Icon status="info" size="md">
    <InfoCircleIcon />
  </Icon>
);

const WarningEventIcon = () => (
  <Icon status="warning" size="md">
    <ExclamationTriangleIcon />
  </Icon>
);

const EventItem = ({ event }: { event: DisplayEvent }) => {
  return (
    <Stack className="fctl-event" key={event.name}>
      <StackItem className="fctl-event__title">
        {event.type === Event.type.NORMAL ? <NormalEventIcon /> : <WarningEventIcon />}
        {event.reasonText}
      </StackItem>
      {event.message && <StackItem>{event.message}</StackItem>}
      <StackItem className="fctl-event__detail">{event.dateText}</StackItem>
    </Stack>
  );
};

export default EventItem;
