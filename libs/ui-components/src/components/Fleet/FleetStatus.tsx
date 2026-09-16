import * as React from 'react';

import { type Fleet } from '@flightctl/types';
import { getFleetStatus, getFleetStatusItems } from '../../utils/status/fleet';
import { useTranslation } from '../../hooks/useTranslation';
import StatusDisplay from '../Status/StatusDisplay';

const FleetStatus = ({ fleet }: { fleet: Fleet }) => {
  const { t } = useTranslation();
  const fleetStatus = getFleetStatus(t, fleet);
  const statusItems = getFleetStatusItems(t);
  const item = statusItems.find((statusItem) => statusItem.id === fleetStatus.type);

  return <StatusDisplay item={item} message={fleetStatus.info} />;
};

export default FleetStatus;
