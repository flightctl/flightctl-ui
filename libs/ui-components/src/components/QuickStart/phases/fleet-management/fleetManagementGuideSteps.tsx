import * as React from 'react';

import { RESOURCE, VERB } from '../../../../types/rbac';
import type { PermissionCheck } from '../../../common/PermissionsContext';
import type { QuickStartGuideStep } from '../../quickStartGuideStepUtils';
import CreateFleetStep from './steps/CreateFleetStep';
import FleetTeamEscalationStep from './steps/FleetTeamEscalationStep';
import HowFleetCreationWorksStep from './steps/HowFleetCreationWorksStep';
import HowFleetsWorkStep from './steps/HowFleetsWorkStep';
import OpenFleetsStep from './steps/OpenFleetsStep';
import UpdateFleetConfigurationsStep from './steps/UpdateFleetConfigurationsStep';
import ViewerUserCapabilitiesStep from './steps/ViewerUserCapabilitiesStep';

export interface FleetManagementGuideRuntimeOptions {
  checkPermissions: (checks: PermissionCheck[]) => boolean[];
  isOnFleetsPage: boolean;
  hasFleets?: boolean;
}

const fleetManagementPermissions: PermissionCheck[] = [
  { kind: RESOURCE.FLEET, verb: VERB.LIST },
  { kind: RESOURCE.FLEET, verb: VERB.GET },
  { kind: RESOURCE.FLEET, verb: VERB.CREATE },
  { kind: RESOURCE.FLEET, verb: VERB.PATCH },
];

export const buildFleetManagementGuideSteps = (options: FleetManagementGuideRuntimeOptions): QuickStartGuideStep[] => {
  const { checkPermissions, isOnFleetsPage, hasFleets = false } = options;

  const [canListFleets, canViewFleet, canCreateFleet, canEditFleet] = checkPermissions(fleetManagementPermissions);
  const hasViewerEscalation = canListFleets && !canCreateFleet;

  const steps: QuickStartGuideStep[] = [];

  if (canListFleets) {
    steps.push({
      mustBeOnListPage: true,
      render: () => (
        <OpenFleetsStep hasFleets={hasFleets} canCreateFleet={canCreateFleet} isOnFleetsPage={isOnFleetsPage} />
      ),
    });
  }

  steps.push({
    render: () => <HowFleetsWorkStep />,
  });

  if (hasViewerEscalation) {
    steps.push({
      render: () => (
        <ViewerUserCapabilitiesStep
          canListFleets={canListFleets}
          canViewFleet={canViewFleet}
          canEditFleet={canEditFleet}
        />
      ),
    });
  } else {
    if (canCreateFleet) {
      steps.push({
        render: () => <CreateFleetStep />,
      });
      steps.push({
        render: () => <HowFleetCreationWorksStep />,
      });
    }

    if (canEditFleet) {
      steps.push({
        render: () => <UpdateFleetConfigurationsStep />,
      });
    }
  }

  if (hasViewerEscalation) {
    steps.push({
      render: () => <FleetTeamEscalationStep canCreateFleet={canCreateFleet} canEditFleet={canEditFleet} />,
    });
  }

  return steps;
};
