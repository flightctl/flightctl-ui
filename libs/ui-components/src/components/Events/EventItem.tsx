import * as React from 'react';
import { Icon, Stack, StackItem, TextContent } from '@patternfly/react-core';
import InfoCircleIcon from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

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
    <Stack>
      <StackItem>
        {event.type === 'Normal' ? <NormalEventIcon /> : <WarningEventIcon />} <strong>{event.reasonText}</strong>
      </StackItem>
      {event.message && <StackItem>{event.message}</StackItem>}
      <StackItem>
        <TextContent>
          <small>{event.dateText}</small>
        </TextContent>
      </StackItem>
    </Stack>
  );
};

export default EventItem;
