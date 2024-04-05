import * as React from 'react';
import { Label, LabelProps } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';
import { QuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/question-circle-icon';
import { WarningTriangleIcon } from '@patternfly/react-icons/dist/js/icons/warning-triangle-icon';

import { getFleetStatusType } from '@app/utils/status/fleet';
import { ConditionType, Fleet } from '@types';
import WithTooltip from '../common/WithTooltip';

const FleetStatus = ({ fleet }: { fleet: Fleet }) => {
  const statusType = getFleetStatusType(fleet);
  let color: LabelProps['color'];
  let icon: React.ReactNode;
  let tooltip: string | undefined;

  switch (statusType) {
    case 'Syncing':
      color = 'orange';
      icon = <InProgressIcon />;
      break;
    case ConditionType.ResourceSyncSynced:
      color = 'green';
      icon = <CheckCircleIcon />;
      break;
    case ConditionType.FleetOverlappingSelectors:
      color = 'orange';
      icon = <WarningTriangleIcon />;
      tooltip = `Fleet's selector overlaps with at least one other fleet, causing ambiguous device ownership.`;
      break;
    default:
      color = 'grey';
      icon = <QuestionCircleIcon />;
      break;
  }

  return (
    <WithTooltip showTooltip={!!tooltip} content={tooltip}>
      <Label color={color} icon={icon}>
        {statusType}
      </Label>
    </WithTooltip>
  );
};

export default FleetStatus;
