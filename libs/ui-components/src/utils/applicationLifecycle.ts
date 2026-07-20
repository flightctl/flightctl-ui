import { ApplicationDesiredState, ApplicationStatusType } from '@flightctl/types';

// Annotations used to indicate the desired state of an application.
const DEVICE_APPLICATION_LIFECYCLE_ANNOTATION = 'device-controller/applicationLifecycle';
const FLEET_APPLICATION_LIFECYCLE_ANNOTATION = 'device-controller/fleetApplicationLifecycle';

// Statuses that can be considered as "stopped" for the purpose of reconciliation.
const reconcileStopStatuses = [
  ApplicationStatusType.ApplicationStatusStopping,
  ApplicationStatusType.ApplicationStatusStopped,
];

// Statuses that can be considered as "running" for the purpose of reconciliation.
const reconcileStartStatuses = [
  ApplicationStatusType.ApplicationStatusStarting,
  ApplicationStatusType.ApplicationStatusPreparing,
  ApplicationStatusType.ApplicationStatusRunning,
];

// Statuses that are considered as transitional from one desired state to another.
export const transitionalStatuses = [
  ApplicationStatusType.ApplicationStatusStarting,
  ApplicationStatusType.ApplicationStatusStopping,
  ApplicationStatusType.ApplicationStatusPreparing,
];

// Statuses that an application must be at, for it to allow to be started.
export const startableStatuses = [
  ApplicationStatusType.ApplicationStatusStopping,
  ApplicationStatusType.ApplicationStatusStopped,
  ApplicationStatusType.ApplicationStatusError,
];

export type ApplicationLifecycleAction = 'start' | 'stop' | 'restart';
export type DeviceAppLifecycleOverrides = Record<string, ApplicationDesiredState>;

type ApplicationLifecycleOverride = {
  desiredState: ApplicationDesiredState;
  desiredStateVersion?: number;
};

const isApplicationDesiredState = (value: unknown): value is ApplicationDesiredState =>
  value === ApplicationDesiredState.ApplicationDesiredStateRunning ||
  value === ApplicationDesiredState.ApplicationDesiredStateStopped;

const parseApplicationLifecycleOverrides = (raw: string | undefined): Record<string, ApplicationLifecycleOverride> => {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce<Record<string, ApplicationLifecycleOverride>>(
      (overrides, [appName, value]) => {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
          return overrides;
        }

        const entry = value as Record<string, unknown>;

        if (isApplicationDesiredState(entry.desiredState)) {
          const override: ApplicationLifecycleOverride = {
            desiredState: entry.desiredState,
          };
          if (typeof entry.desiredStateVersion === 'number') {
            override.desiredStateVersion = entry.desiredStateVersion;
          }
          overrides[appName] = override;
        }

        return overrides;
      },
      {},
    );
  } catch {
    return {};
  }
};

const desiredStateIsAtLeastAsRecent = (
  src: ApplicationLifecycleOverride,
  dst: ApplicationLifecycleOverride,
): boolean => {
  if (dst.desiredState === undefined) {
    return true;
  }
  if (src.desiredStateVersion === undefined) {
    return dst.desiredStateVersion === undefined;
  }
  if (dst.desiredStateVersion === undefined) {
    return true;
  }
  return src.desiredStateVersion >= dst.desiredStateVersion;
};

/**
 * Merges fleet-level and device-level lifecycle overrides per application.
 * The overrides are stored as annotations in the device, with "desiredStateVersion"
 * indicating the sequence of events.
 *
 * @example
 *  // Fleet-level override contains:
 *   { 'my-app': { desiredState: ApplicationDesiredStateStopped, desiredStateVersion: 3 } },
 *  // Device-level override contains:
 *   { 'my-app': { desiredState: ApplicationDesiredStateRunning, desiredStateVersion: 7 } },
 *  --> The result is that the application's "desiredState" is "running"
 */
const mergeApplicationLifecycleLayers = (
  fleetOverrides: Record<string, ApplicationLifecycleOverride>,
  deviceOverrides: Record<string, ApplicationLifecycleOverride>,
): DeviceAppLifecycleOverrides => {
  const merged: DeviceAppLifecycleOverrides = {};

  for (const [appName, fleetOverride] of Object.entries(fleetOverrides)) {
    merged[appName] = fleetOverride.desiredState;
  }

  for (const [appName, deviceOverride] of Object.entries(deviceOverrides)) {
    const fleetOverride = fleetOverrides[appName];
    if (!fleetOverride || desiredStateIsAtLeastAsRecent(deviceOverride, fleetOverride)) {
      merged[appName] = deviceOverride.desiredState;
    }
  }

  return merged;
};

// True when the application has a mismatch between its desired state and its actual status.
export const hasAplicationStatusMismatch = (
  status: ApplicationStatusType,
  desiredState: ApplicationDesiredState | undefined,
): boolean => {
  if (!desiredState || desiredState === ApplicationDesiredState.ApplicationDesiredStateRunning) {
    return reconcileStopStatuses.includes(status);
  }
  return reconcileStartStatuses.includes(status);
};

/** Parses fleet and device lifecycle annotations; newer desiredStateVersion wins per application. */
export const getDeviceAppLifecycleOverrides = (
  deviceAnnotations: Record<string, string> = {},
): DeviceAppLifecycleOverrides => {
  const fleetOverrides = parseApplicationLifecycleOverrides(deviceAnnotations[FLEET_APPLICATION_LIFECYCLE_ANNOTATION]);
  const deviceOverrides = parseApplicationLifecycleOverrides(
    deviceAnnotations[DEVICE_APPLICATION_LIFECYCLE_ANNOTATION],
  );
  return mergeApplicationLifecycleLayers(fleetOverrides, deviceOverrides);
};

export const shouldClearPendingLifecycleAction = (
  pendingAction: ApplicationLifecycleAction,
  currentStatus: ApplicationStatusType,
  statusAtRequest: ApplicationStatusType,
  restartsAtRequest: number | undefined,
  currentRestarts: number,
): boolean => {
  if (transitionalStatuses.includes(currentStatus)) {
    return true;
  }

  switch (pendingAction) {
    case 'stop':
      return startableStatuses.includes(currentStatus);

    case 'start':
      return (
        currentStatus === ApplicationStatusType.ApplicationStatusStarting ||
        currentStatus === ApplicationStatusType.ApplicationStatusRunning ||
        currentStatus === ApplicationStatusType.ApplicationStatusError
      );
    case 'restart':
      return (
        currentStatus === ApplicationStatusType.ApplicationStatusStarting ||
        currentStatus !== statusAtRequest ||
        (restartsAtRequest !== undefined && currentRestarts !== restartsAtRequest)
      );
    default:
      return false;
  }
};
