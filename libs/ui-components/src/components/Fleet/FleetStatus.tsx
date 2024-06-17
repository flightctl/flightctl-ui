import * as React from 'react';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { QuestionCircleIcon } from '@patternfly/react-icons/dist/js/icons/question-circle-icon';
import { WarningTriangleIcon } from '@patternfly/react-icons/dist/js/icons/warning-triangle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';

import { ConditionType, Fleet } from '@flightctl/types';
import { fleetStatusLabels, getFleetSyncStatus } from '../../utils/status/fleet';
import { useTranslation } from '../../hooks/useTranslation';
import StatusLabel, { StatusLabelColor } from '../common/StatusLabel';

const FleetStatus = ({ fleet }: { fleet: Fleet }) => {
  const { t } = useTranslation();
  const syncStatus = getFleetSyncStatus(fleet, t);
  const statusLabels = fleetStatusLabels(t);

  let color: StatusLabelColor;
  let icon: React.ReactNode;

  switch (syncStatus.status) {
    case ConditionType.FleetValid:
      color = 'success';
      icon = <CheckCircleIcon />;
      break;
    case ConditionType.FleetOverlappingSelectors:
      color = 'warning';
      icon = <WarningTriangleIcon />;
      break;
    case 'SyncPending':
      icon = <InProgressIcon />;
      color = 'info';
      break;
    case 'Invalid':
      color = 'danger';
      icon = <ExclamationCircleIcon />;
      break;
    default:
      color = 'unknown';
      icon = <QuestionCircleIcon />;
      break;
  }

  return (
    <StatusLabel label={statusLabels[syncStatus.status]} status={color} icon={icon} tooltip={syncStatus.message} />
  );
};

export default FleetStatus;
