import * as React from 'react';
import { Content, Icon, Stack, StackItem } from '@patternfly/react-core';
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
    <Stack>
      <StackItem>
        {event.type === Event.type.NORMAL ? <NormalEventIcon /> : <WarningEventIcon />}{' '}
        <span style={{ fontWeight: 'var(--pf-t--global--font--weight--body--bold)' }}>{event.reasonText}</span>
      </StackItem>
      {event.message && <StackItem>{event.message}</StackItem>}
      <StackItem>
        <Content component="small">{event.dateText}</Content>
      </StackItem>
    </Stack>
  );
};

export default EventItem;
