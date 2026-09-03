import * as React from 'react';

import { useQuickStart } from './QuickStartContext';
import { GuideShell } from './guide/GuideShell';
import type { QuickStartPhaseId } from './types';

const OrientationPhase = React.lazy(() => import('./phases/orientation/OrientationPhase'));
const EnrollmentPhase = React.lazy(() => import('./phases/enrollment/EnrollmentPhase'));
const FleetManagementPhase = React.lazy(() => import('./phases/fleet-management/FleetManagementPhase'));
const ImageBuildingPhase = React.lazy(() => import('./phases/image-building/ImageBuildingPhase'));

const getPhaseComponent = (phaseId: QuickStartPhaseId) => {
  switch (phaseId) {
    case 'orientation':
      return <OrientationPhase />;
    case 'enroll-device':
      return <EnrollmentPhase />;
    case 'manage-fleet':
      return <FleetManagementPhase />;
    case 'build-image':
      return <ImageBuildingPhase />;
  }
};

const QuickStartGuide = () => {
  const { activePhaseId } = useQuickStart();

  if (!activePhaseId) {
    return null;
  }

  return (
    <GuideShell>
      <React.Suspense fallback={null}>{getPhaseComponent(activePhaseId)}</React.Suspense>
    </GuideShell>
  );
};

export default QuickStartGuide;
