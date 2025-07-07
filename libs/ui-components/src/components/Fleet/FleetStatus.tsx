import * as React from 'react';

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

  switch (syncStatus.status) {
    case ConditionType.FleetValid:
      level = 'success';
      break;
    case 'SyncPending':
      level = 'info';
      break;
    case 'Invalid':
      level = 'danger';
      break;
    default:
      level = 'unknown';
      break;
  }

  return <StatusDisplayContent label={statusLabels[syncStatus.status]} level={level} message={syncStatus.message} />;
};

export default FleetStatus;
