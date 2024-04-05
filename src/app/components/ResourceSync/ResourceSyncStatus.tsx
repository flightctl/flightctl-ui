import * as React from 'react';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';
import { QuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/question-circle-icon';
import { WarningTriangleIcon } from '@patternfly/react-icons/dist/js/icons/warning-triangle-icon';

import { ConditionType, ResourceSync } from '@types';
import WithTooltip from '../common/WithTooltip';
import { Label, LabelProps } from '@patternfly/react-core';
import { getRepositorySyncStatus } from '@app/utils/status/repository';

const ResourceSyncStatus = ({ resourceSync }: { resourceSync: ResourceSync }) => {
  const statusType = getRepositorySyncStatus(resourceSync);
  let color: LabelProps['color'];
  let icon: React.ReactNode;

  switch (statusType.status) {
    case 'Not synced':
    case ConditionType.ResourceSyncResourceParsed:
    case 'Not parsed':
    case 'Sync pending':
      color = 'orange';
      icon = <InProgressIcon />;
      break;
    case ConditionType.ResourceSyncSynced:
    case ConditionType.RepositoryAccessible:
      color = 'green';
      icon = <CheckCircleIcon />;
      break;
    case 'Not accessible':
      color = 'orange';
      icon = <WarningTriangleIcon />;
      break;
    default:
      color = 'grey';
      icon = <QuestionCircleIcon />;
      break;
  }

  return (
    <WithTooltip showTooltip={!!statusType.message} content={statusType.message}>
      <Label color={color} icon={icon}>
        {statusType.status}
      </Label>
    </WithTooltip>
  );
};

export default ResourceSyncStatus;
