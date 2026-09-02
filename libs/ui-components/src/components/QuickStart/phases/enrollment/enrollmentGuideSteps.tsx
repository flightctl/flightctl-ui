import * as React from 'react';

import { RESOURCE, VERB } from '../../../../types/rbac';
import type { PermissionCheck } from '../../../common/PermissionsContext';
import type { QuickStartGuideStep } from '../../quickStartGuideStepUtils';
import AfterApprovalStep from './steps/AfterApprovalStep';
import ApproveDeviceStep from './steps/ApproveDeviceStep';
import BootDeviceStep from './steps/BootDeviceStep';
import ViewerUserCapabilitiesStep from './steps/ViewerUserCapabilitiesStep';
import DeviceDetailStep from './steps/DeviceDetailStep';
import ExploreDevicesStep from './steps/ExploreDevicesStep';
import FindPendingDevicesStep from './steps/FindPendingStep';
import OpenDevicesStep from './steps/OpenDevicesStep';
import ReviewRequestStep from './steps/ReviewRequestStep';
import TeamEscalationStep from './steps/TeamEscalationStep';

export interface EnrollmentGuideRuntimeOptions {
  checkPermissions: (checks: PermissionCheck[]) => boolean[];
  isOnDevicesPage: boolean;
  isStepActionCompleted: (stepIndex: number) => boolean;
  hasDevices?: boolean;
  hasPendingDevices?: boolean;
}

const enrollmentPermissions: PermissionCheck[] = [
  { kind: RESOURCE.DEVICE, verb: VERB.LIST },
  { kind: RESOURCE.ENROLLMENT_REQUEST, verb: VERB.LIST },
  { kind: RESOURCE.ENROLLMENT_REQUEST, verb: VERB.GET },
  { kind: RESOURCE.ENROLLMENT_REQUEST_APPROVAL, verb: VERB.UPDATE },
  { kind: RESOURCE.IMAGE_EXPORT_DOWNLOAD, verb: VERB.GET },
  { kind: RESOURCE.IMAGE_EXPORT, verb: VERB.CREATE },
];

export const buildEnrollmentGuideSteps = (options: EnrollmentGuideRuntimeOptions): QuickStartGuideStep[] => {
  const { checkPermissions, isOnDevicesPage, hasDevices = false, hasPendingDevices = false } = options;

  const [canListDevices, canViewDevice, canListEr, canViewEr, canApproveEr, canDownloadImage, canCreateImageExport] =
    checkPermissions(enrollmentPermissions);

  const steps: QuickStartGuideStep[] = [];

  if (canApproveEr) {
    steps.push({
      render: () => <BootDeviceStep />,
    });
  }

  if (canListDevices) {
    steps.push({
      mustBeOnListPage: true,
      render: () => (
        <OpenDevicesStep hasDevices={hasDevices} canApproveEr={canApproveEr} isOnDevicesPage={isOnDevicesPage} />
      ),
    });
  }

  const hasViewerEscalation = canListDevices && !canApproveEr;
  if (hasViewerEscalation) {
    steps.push({
      render: () => (
        <ViewerUserCapabilitiesStep
          canListDevices={canListDevices}
          canListEnrollmentRequests={canListEr}
          canViewDevice={canViewDevice}
        />
      ),
    });
  }
  steps.push({
    render: () => <ExploreDevicesStep hasDevices={hasDevices} />,
  });

  if (canListEr) {
    steps.push({
      render: () => <FindPendingDevicesStep hasPendingDevices={hasPendingDevices} />,
    });
    steps.push({
      render: () => <ReviewRequestStep canViewEr={canViewEr} canApprove={canApproveEr} />,
    });

    if (canApproveEr) {
      steps.push({
        render: () => <ApproveDeviceStep />,
      });
    }
  }

  if (canViewDevice) {
    steps.push({
      render: () => (canApproveEr ? <AfterApprovalStep /> : <DeviceDetailStep />),
    });
  }

  if (hasViewerEscalation) {
    steps.push({
      render: () => (
        <TeamEscalationStep
          canApproveEnrollment={canApproveEr}
          canDownloadExport={canDownloadImage}
          canCreateExport={canCreateImageExport}
        />
      ),
    });
  }

  return steps;
};
