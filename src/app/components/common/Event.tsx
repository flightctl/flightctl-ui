import * as React from 'react';

import { AppEvent } from '@app/types/extraTypes';
import { ExclamationCircleIcon, ExclamationTriangleIcon, InfoIcon, WrenchIcon } from '@patternfly/react-icons';
import { Icon, Stack, StackItem } from '@patternfly/react-core';
import { getDateDisplay } from '@app/utils/dateUtils';

const getIcon = (event: AppEvent) => {
  switch (event.type) {
    case 'error':
      return (
        <Icon size="md" status="danger">
          <ExclamationCircleIcon />
        </Icon>
      );

    case 'warning':
      return (
        <Icon size="md" status="warning">
          <ExclamationTriangleIcon />
        </Icon>
      );

    case 'action':
      return (
        <Icon size="md" status="custom">
          <WrenchIcon />
        </Icon>
      );

    case 'info':
      return (
        <Icon size="md" status="info">
          <InfoIcon />
        </Icon>
      );
  }
};

const Event = ({ event }: { event: AppEvent }) => {
  return (
    <Stack>
      <StackItem style={{ color: 'var(--pf-v5-global--primary-color--100' }}>
        {getIcon(event)} {event.title}
      </StackItem>

      <StackItem>{event.content}</StackItem>
      <StackItem style={{ color: 'var(--pf-v5-global--Color--200)' }}>
        {getDateDisplay(event.timestamp, true)}
      </StackItem>
    </Stack>
  );
};

export default Event;
