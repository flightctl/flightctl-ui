import type { PermissionCheck } from '../common/PermissionsContext';
import type { QuickStartPhaseId } from './types';
import { buildEnrollmentGuideSteps } from './phases/enrollment/enrollmentGuideSteps';
import { buildFleetManagementGuideSteps } from './phases/fleet-management/fleetManagementGuideSteps';
import { buildImageBuildingGuideSteps } from './phases/image-building/imageBuildingGuideSteps';
import { ORIENTATION_STEP_COUNT } from './phases/orientation/OrientationPhase';

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
        isStepActionCompleted: () => false,
      }).length;
    case 'manage-fleet':
      return buildFleetManagementGuideSteps({
        checkPermissions,
        isOnFleetsPage: false,
      }).length;
  }
};
