import type { PhaseCardStatus, QuickStartPersistedState, QuickStartPhaseDefinition, QuickStartPhaseId } from './types';
import type { PermissionCheck } from '../common/PermissionsContext';
import { buildEnrollmentGuideSteps } from './phases/enrollment/enrollmentGuideSteps';
import { buildFleetManagementGuideSteps } from './phases/fleet-management/fleetManagementGuideSteps';
import { buildImageBuildingGuideSteps } from './phases/image-building/imageBuildingGuideSteps';
import { ORIENTATION_STEP_COUNT } from './phases/orientation/OrientationPhase';

export const isPhaseComplete = (phaseId: QuickStartPhaseId, persisted: QuickStartPersistedState): boolean =>
  persisted.completedPhases.includes(phaseId);

export const pathMatchesRoute = (pathname: string, routePath: string): boolean => {
  if (routePath === '/') {
    return pathname === '/';
  }
  return pathname === routePath || pathname.startsWith(`${routePath}/`);
};

const isPhaseLocked = (
  phaseIndex: number,
  visiblePhases: QuickStartPhaseDefinition[],
  persisted: QuickStartPersistedState,
): boolean => {
  if (phaseIndex === 0) {
    return false;
  }

  const previousPhase = visiblePhases[phaseIndex - 1];
  return !isPhaseComplete(previousPhase.id, persisted);
};

export const getPhaseStatus = (
  phaseId: QuickStartPhaseId,
  phaseIndex: number,
  visiblePhases: QuickStartPhaseDefinition[],
  persisted: QuickStartPersistedState,
  activePhaseId: QuickStartPhaseId | null = null,
): PhaseCardStatus => {
  if (isPhaseLocked(phaseIndex, visiblePhases, persisted)) {
    return 'locked';
  }
  if (isPhaseComplete(phaseId, persisted)) {
    return 'complete';
  }
  if (activePhaseId === phaseId || persisted.phaseProgress[phaseId] !== undefined) {
    return 'in-progress';
  }
  return 'not-started';
};

export const getPhaseStepCount = (
  phaseId: QuickStartPhaseId,
  checkPermissions: (checks: PermissionCheck[]) => boolean[],
): number => {
  switch (phaseId) {
    case 'orientation':
      return ORIENTATION_STEP_COUNT;
    case 'build-image':
      return buildImageBuildingGuideSteps({
        checkPermissions,
        isOnBuildsPage: false,
        hasBuilds: false,
      }).length;
    case 'enroll-device':
      return buildEnrollmentGuideSteps({
        checkPermissions,
        isOnDevicesPage: false,
      }).length;
    case 'manage-fleet':
      return buildFleetManagementGuideSteps({
        checkPermissions,
        isOnFleetsPage: false,
      }).length;
  }
};
