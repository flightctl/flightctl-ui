import * as React from 'react';
import { DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from '@patternfly/react-core';
import { type StatusLevel } from '../../../utils/status/common';

import './DeviceDetailsStatusAccent.css';

const DeviceDetailsStatusAccent = ({
  level,
  statusLabel,
  statusContent,
}: {
  level: StatusLevel;
  statusLabel: React.ReactNode;
  statusContent: React.ReactNode;
}) => {
  const hasAccent = level === 'warning' || level === 'danger';
  return (
    <DescriptionListGroup
      className={`fctl-device-details-status-accent ${hasAccent ? `fctl-device-details-status-accent--${level}` : ''}`}
    >
      <DescriptionListTerm>{statusLabel}</DescriptionListTerm>
      <DescriptionListDescription>{statusContent}</DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default DeviceDetailsStatusAccent;
