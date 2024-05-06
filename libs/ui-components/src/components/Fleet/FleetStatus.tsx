import * as React from 'react';
import { Label, LabelProps } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { QuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/question-circle-icon';
import { WarningTriangleIcon } from '@patternfly/react-icons/dist/js/icons/warning-triangle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

import { ConditionType, Fleet } from '@flightctl/types';
import { fleetStatusLabels, getFleetSyncStatus } from '../../utils/status/fleet';
import WithTooltip from '../common/WithTooltip';
import { useTranslation } from '../../hooks/useTranslation';

const FleetStatus = ({ fleet }: { fleet: Fleet }) => {
  const { t } = useTranslation();
  const syncStatus = getFleetSyncStatus(fleet, t);
  const statusLabels = fleetStatusLabels(t);

  let color: LabelProps['color'];
  let icon: React.ReactNode;

  switch (syncStatus.status) {
    case ConditionType.FleetValid:
      color = 'green';
      icon = <CheckCircleIcon />;
      break;
    case ConditionType.FleetOverlappingSelectors:
      color = 'orange';
      icon = <WarningTriangleIcon />;
      break;
    case 'Invalid':
      color = 'red';
      icon = <ExclamationCircleIcon />;
      break;
    default:
      color = 'grey';
      icon = <QuestionCircleIcon />;
      break;
  }

  return (
    <WithTooltip showTooltip={!!syncStatus.message} content={syncStatus.message}>
      <Label color={color} icon={icon}>
        {statusLabels[syncStatus.status]}
      </Label>
    </WithTooltip>
  );
};

export default FleetStatus;
