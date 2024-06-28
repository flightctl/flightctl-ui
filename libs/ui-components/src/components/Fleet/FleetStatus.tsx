import * as React from 'react';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/outlined-question-circle-icon';
import { WarningTriangleIcon } from '@patternfly/react-icons/dist/js/icons/warning-triangle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';

import { ConditionType, Fleet } from '@flightctl/types';
import { fleetStatusLabels, getFleetSyncStatus } from '../../utils/status/fleet';
import { useTranslation } from '../../hooks/useTranslation';
import { StatusDisplayContent } from '../Status/StatusDisplay';
import { StatusLevel } from '../../utils/status/common';

const FleetStatus = ({ fleet }: { fleet: Fleet }) => {
  const { t } = useTranslation();
  const syncStatus = getFleetSyncStatus(fleet, t);
  const statusLabels = fleetStatusLabels(t);

  let level: StatusLevel;
  let icon: React.ReactNode;

  switch (syncStatus.status) {
    case ConditionType.FleetValid:
      level = 'success';
      icon = <CheckCircleIcon />;
      break;
    case ConditionType.FleetOverlappingSelectors:
      level = 'warning';
      icon = <WarningTriangleIcon />;
      break;
    case 'SyncPending':
      icon = <InProgressIcon />;
      level = 'info';
      break;
    case 'Invalid':
      level = 'danger';
      icon = <ExclamationCircleIcon />;
      break;
    default:
      level = 'unknown';
      icon = <OutlinedQuestionCircleIcon />;
      break;
  }

  return (
    <StatusDisplayContent
      label={statusLabels[syncStatus.status]}
      level={level}
      icon={icon}
      tooltip={syncStatus.message}
    />
  );
};

export default FleetStatus;
