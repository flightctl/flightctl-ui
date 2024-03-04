import * as React from 'react';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { Icon, Tooltip } from '@patternfly/react-core';

const StatusInfo = ({ statusInfo }: { statusInfo: { status: string; message?: string } }) => {
  return (
    <div>
      {statusInfo.status}{' '}
      {statusInfo.message && (
        <Tooltip content={statusInfo.message}>
          <Icon status="info">
            <InfoCircleIcon />
          </Icon>
        </Tooltip>
      )}
    </div>
  );
};

export default StatusInfo;
