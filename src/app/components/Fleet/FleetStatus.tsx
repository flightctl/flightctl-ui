import { getFleetStatusType } from '@app/utils/status/fleet';
import { CheckCircleIcon, InProgressIcon, QuestionCircleIcon, WarningTriangleIcon } from '@patternfly/react-icons';
import { ConditionType, Fleet } from '@types';
import * as React from 'react';
import WithTooltip from '../common/WithTooltip';
import { Label, LabelProps } from '@patternfly/react-core';

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
