import * as React from 'react';

import { RESOURCE, VERB } from '../../../../types/rbac';
import type { PermissionCheck } from '../../../common/PermissionsContext';
import type { QuickStartGuideStep } from '../../quickStartGuideStepUtils';
import BuildBaseImageStep from './steps/BuildBaseImageStep';
import ConfigureDeviceEnrollmentStep from './steps/ConfigureDeviceEnrollmentStep';
import ConfigureImageOutputStep from './steps/ConfigureImageOutputStep';
import ExpandBuildRowStep from './steps/ExpandBuildRowStep';
import ExploreBuildDetailPageStep from './steps/ExploreBuildDetailPageStep';
import ExploreDetailsPageStep from './steps/ExploreDetailsPageStep';
import MeetImageBuildWizardStep from './steps/MeetImageBuildWizardStep';
import OpenBuildDetailPageStep from './steps/OpenBuildDetailPageStep';
import OpenDetailsPageStep from './steps/OpenDetailsPageStep';
import OpenImageBuildsStep from './steps/OpenImageBuildsStep';
import FindBuildActionsStep from './steps/FindBuildActionsStep';
import PreviewInListStep from './steps/PreviewInListStep';
import PublishToCatalogStep from './steps/PublishToCatalogStep';
import ReviewAndStartBuildStep from './steps/ReviewAndStartBuildStep';
import StartNewImageBuildStep from './steps/StartNewImageBuildStep';
import TeamEscalationStep from './steps/TeamEscalationStep';
import ViewerUserCapabilitiesStep from './steps/ViewerUserCapabilitiesStep';

export interface ImageBuildingGuideRuntimeOptions {
  checkPermissions: (checks: PermissionCheck[]) => boolean[];
  isOnBuildsPage: boolean;
  hasBuilds: boolean;
}

const imageBuildingPermissions: PermissionCheck[] = [
  { kind: RESOURCE.IMAGE_BUILD, verb: VERB.LIST },
  { kind: RESOURCE.IMAGE_BUILD, verb: VERB.GET },
  { kind: RESOURCE.IMAGE_BUILD, verb: VERB.CREATE },
  { kind: RESOURCE.IMAGE_BUILD, verb: VERB.DELETE },
  { kind: RESOURCE.IMAGE_BUILD_CANCEL, verb: VERB.CREATE },
  { kind: RESOURCE.IMAGE_BUILD_NEW_VERSION, verb: VERB.CREATE },
  { kind: RESOURCE.IMAGE_BUILD_LOG, verb: VERB.GET },
  { kind: RESOURCE.IMAGE_EXPORT, verb: VERB.CREATE },
  { kind: RESOURCE.IMAGE_EXPORT_DOWNLOAD, verb: VERB.GET },
  { kind: RESOURCE.IMAGE_PROMOTION, verb: VERB.CREATE },
];

export const buildImageBuildingGuideSteps = (options: ImageBuildingGuideRuntimeOptions): QuickStartGuideStep[] => {
  const { checkPermissions, isOnBuildsPage, hasBuilds } = options;

  const [
    canListBuilds,
    canViewBuild,
    canCreateBuild,
    canDeleteBuild,
    canCancelBuild,
    canCreateNewVersion,
    canViewLogs,
    canCreateExport,
    canDownloadExport,
    canAddToCatalog,
  ] = checkPermissions(imageBuildingPermissions);

  const steps: QuickStartGuideStep[] = [];

  if (canListBuilds) {
    steps.push({
      mustBeOnListPage: true,
      render: () => (
        <OpenImageBuildsStep canCreateBuild={canCreateBuild} isOnBuildsPage={isOnBuildsPage} hasBuilds={hasBuilds} />
      ),
    });
  }

  const hasViewerEscalation = canListBuilds && !canCreateBuild;
  if (hasViewerEscalation) {
    steps.push({
      render: () => (
        <ViewerUserCapabilitiesStep
          canListBuilds={canListBuilds}
          canViewBuild={canViewBuild}
          canViewLogs={canViewLogs}
          canDownloadExport={canDownloadExport}
        />
      ),
    });

    if (canViewBuild) {
      steps.push({
        render: () => <PreviewInListStep hasBuilds={hasBuilds} />,
      });
      steps.push({
        render: () => <OpenDetailsPageStep />,
      });
      steps.push({
        render: () => <ExploreDetailsPageStep />,
      });
    }

    steps.push({
      render: () => (
        <TeamEscalationStep
          canCreateBuild={canCreateBuild}
          canCreateExport={canCreateExport}
          canDownloadExport={canDownloadExport}
          canAddToCatalog={canAddToCatalog}
        />
      ),
    });

    return steps;
  }

  if (canCreateBuild) {
    steps.push({
      render: () => <StartNewImageBuildStep />,
    });
    steps.push({
      render: () => <MeetImageBuildWizardStep />,
    });
    steps.push({
      render: () => <BuildBaseImageStep />,
    });
    steps.push({
      render: () => <ConfigureImageOutputStep />,
    });
    steps.push({
      render: () => <ConfigureDeviceEnrollmentStep />,
    });
    if (canAddToCatalog) {
      steps.push({
        render: () => <PublishToCatalogStep />,
      });
    }
    steps.push({
      render: () => <ReviewAndStartBuildStep />,
    });
    steps.push({
      render: () => <ExpandBuildRowStep />,
    });
    steps.push({
      render: () => (
        <FindBuildActionsStep
          canViewBuild={canViewBuild}
          canDeleteBuild={canDeleteBuild}
          canCancelBuild={canCancelBuild}
          canCreateNewVersion={canCreateNewVersion}
          canAddToCatalog={canAddToCatalog}
        />
      ),
    });
    steps.push({
      render: () => <OpenBuildDetailPageStep />,
    });
    steps.push({
      render: () => <ExploreBuildDetailPageStep />,
    });
  }

  return steps;
};
