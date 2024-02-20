import * as React from 'react';

import { StatusType } from '@app/types/extraTypes';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { Tooltip } from '@patternfly/react-core';

const StatusInfo = ({ statusInfo }: { statusInfo: { status: StatusType; message?: string } }) => {
  return (
    <div>
      {statusInfo.status}{' '}
      {statusInfo.message && (
        <Tooltip content={statusInfo.message}>
          <InfoCircleIcon />
        </Tooltip>
      )}
    </div>
  );
};

export default StatusInfo;
