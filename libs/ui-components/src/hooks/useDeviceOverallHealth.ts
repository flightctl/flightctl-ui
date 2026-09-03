import * as React from 'react';

import type { Device, DeviceStatus } from '@flightctl/types';
import { getAppStatusLevel, getAppSummaryStatusLevel } from '../utils/status/applications';
import { getDeviceSummaryStatusLevel } from '../utils/status/devices';
import { getIntegrityStatusLevel } from '../utils/status/integrity';
import { getDeviceResourceStatusLevel } from '../utils/status/resources';
import { getSystemUpdateStatusLevel } from '../utils/status/system';
import { type HealthLevel } from '../utils/status/common';

export type DeviceHealthItem = {
  type: 'status' | 'apps';
  level: HealthLevel;
  itemCount: number;
};

export type DeviceOverallHealth = {
  level: HealthLevel;
  statusHealth: DeviceHealthItem;
  appsHealth: DeviceHealthItem;
};

type AttentionHealthLevel = 'danger' | 'warning';
const isAttentionHealthLevel = (level: string): level is AttentionHealthLevel => ['danger', 'warning'].includes(level);

const getWorstLevel = (healthLevels: HealthLevel[]): HealthLevel =>
  healthLevels.reduce<HealthLevel | null>((accum, current) => {
    if (accum === 'danger' || current === 'danger') {
      return 'danger';
    }
    if (accum === 'warning' || current === 'warning') {
      return 'warning';
    }
    return null;
  }, null);

const getStatusHealth = (deviceStatus: DeviceStatus): DeviceHealthItem => {
  const resources = deviceStatus.resources;
  const attentionLevels: AttentionHealthLevel[] = [
    getDeviceSummaryStatusLevel(deviceStatus.summary?.status),
    getAppSummaryStatusLevel(deviceStatus.applicationsSummary?.status),
    getSystemUpdateStatusLevel(deviceStatus.updated?.status),
    getIntegrityStatusLevel(deviceStatus.integrity?.status),
    getDeviceResourceStatusLevel(resources?.cpu),
    getDeviceResourceStatusLevel(resources?.disk),
    getDeviceResourceStatusLevel(resources?.memory),
  ]
    .map((level) => (isAttentionHealthLevel(level) ? level : null))
    .filter((level) => level !== null);

  if (attentionLevels.length === 0) {
    return { type: 'status', itemCount: 0, level: null };
  }

  return {
    type: 'status',
    itemCount: attentionLevels.length,
    level: getWorstLevel(attentionLevels),
  };
};

const getApplicationHealth = (deviceStatus: DeviceStatus): DeviceHealthItem => {
  // The individual applications must be aligned to the overall application summary.
  const appSummaryLevel = getAppSummaryStatusLevel(deviceStatus.applicationsSummary?.status);
  if (!isAttentionHealthLevel(appSummaryLevel)) {
    return { type: 'apps', itemCount: 0, level: null };
  }

  let hasErrors = false;
  let counts = 0;

  deviceStatus.applications.forEach((app) => {
    const level = getAppStatusLevel(app.status);
    if (level === 'danger') {
      hasErrors = true;
    }
    if (level !== null) {
      counts += 1;
    }
  });

  return { type: 'apps', itemCount: counts, level: counts > 0 ? (hasErrors ? 'danger' : 'warning') : null };
};

export const useDeviceOverallHealth = (device: Required<Device>): DeviceOverallHealth =>
  React.useMemo(() => {
    const appsHealth = getApplicationHealth(device.status);
    const statusHealth = getStatusHealth(device.status);

    return {
      statusHealth,
      appsHealth,
      level: getWorstLevel([statusHealth.level, appsHealth.level]),
    };
  }, [device]);
