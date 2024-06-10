import * as React from 'react';
import { Flex, FlexItem, Icon } from '@patternfly/react-core';

import WithTooltip from './WithTooltip';

import './StatusLabel.css';

// Equals IconComponentProps['status'] + "unknown" for grey color
export type StatusLabelColor = 'custom' | 'info' | 'success' | 'warning' | 'danger' | 'unknown';

const colorClass: Partial<Record<StatusLabelColor, string>> = {
  unknown: '--pf-v5-global--Color--100',
};

type StatusLabelProps = { label: string; tooltip?: string; status: StatusLabelColor; icon: React.ReactNode };

const StatusLabel = ({ label, tooltip, status, icon }: StatusLabelProps) => {
  const iconStatus = status === 'unknown' ? undefined : status;
  const statusColor = colorClass[status];

  const style = statusColor ? ({ '--pf-v5-c-icon__content--Color': statusColor } as React.CSSProperties) : undefined;

  return (
    <WithTooltip showTooltip={!!tooltip} content={tooltip}>
      <Flex className="ftcl_status-label">
        <FlexItem>
          <Icon status={iconStatus} style={style}>
            {icon}
          </Icon>
        </FlexItem>
        <FlexItem>{label}</FlexItem>
      </Flex>
    </WithTooltip>
  );
};

export default StatusLabel;
