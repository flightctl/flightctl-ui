import * as React from 'react';

import { ResourceKind } from '@flightctl/types';
import { useAppContext } from '../../../../hooks/useAppContext';
import { usePermissionsContext } from '../../../common/PermissionsContext';
import { useQuickStartGuide } from '../../QuickStartContext';
import { buildEnrollmentGuideSteps } from './enrollmentGuideSteps';
import { pathMatchesRoute } from '../../quickStartPhaseUtils';
import { ROUTE } from '../../../../hooks/useNavigate';
import { useQuickStartListHasItems } from '../../useQuickStartListHasItems';
import { RESOURCE, VERB } from '../../../../types/rbac';

const listPermissions = [
  { kind: RESOURCE.DEVICE, verb: VERB.LIST },
  { kind: RESOURCE.ENROLLMENT_REQUEST, verb: VERB.LIST },
];

const EnrollmentPhase = () => {
  const { checkPermissions } = usePermissionsContext();
  const { router } = useAppContext();
  const location = router.useLocation();
  const { activePhaseId, activeStepIndex, setStepIndex, setGuidePresentation, setGuideActions, completePhase } =
    useQuickStartGuide();

  const [canListDevices, canListEnrollmentRequests] = checkPermissions(listPermissions);

  const [completedNavigationSteps, setCompletedNavigationSteps] = React.useState<Record<number, boolean>>({});
  const { hasItems: hasDevices } = useQuickStartListHasItems(canListDevices ? ResourceKind.DEVICE : undefined);
  const { hasItems: hasPendingDevices } = useQuickStartListHasItems(
    canListEnrollmentRequests ? ResourceKind.ENROLLMENT_REQUEST : undefined,
  );
  const isOnDevicesPage = pathMatchesRoute(location.pathname, router.appRoutes[ROUTE.DEVICES]);

  const steps = React.useMemo(
    () =>
      buildEnrollmentGuideSteps({
        isStepActionCompleted: (stepIndex) => completedNavigationSteps[stepIndex] ?? false,
        checkPermissions,
        isOnDevicesPage,
        hasDevices,
        hasPendingDevices,
      }),
    [checkPermissions, completedNavigationSteps, hasDevices, hasPendingDevices, isOnDevicesPage],
  );

  const activeStep = steps[activeStepIndex];
  const isLastStep = activeStep ? activeStepIndex >= steps.length - 1 : false;

  const onNext = React.useCallback(() => {
    if (!activeStep) {
      return;
    }
    if (isLastStep) {
      completePhase();
      return;
    }
    setCompletedNavigationSteps({});
    setStepIndex(activeStepIndex + 1);
  }, [activeStep, activeStepIndex, completePhase, isLastStep, setStepIndex]);

  const onBack = React.useCallback(() => {
    setCompletedNavigationSteps({});
    setStepIndex(activeStepIndex - 1);
  }, [activeStepIndex, setStepIndex]);

  React.useEffect(() => {
    if (!activeStep) {
      return;
    }
    setGuidePresentation({
      totalSteps: steps.length,
      canGoBack: activeStepIndex > 0,
      canGoNext: activeStep.mustBeOnListPage ? isOnDevicesPage : true,
      isLastStep: activeStepIndex >= steps.length - 1,
    });
  }, [activeStep, activeStepIndex, setGuidePresentation, isOnDevicesPage, steps.length]);

  React.useEffect(() => {
    if (!activeStep) {
      setGuideActions(null);
      return;
    }
    setGuideActions({ onBack, onNext });
    return () => setGuideActions(null);
  }, [activeStep, onBack, onNext, setGuideActions]);

  if (activePhaseId !== 'enroll-device') {
    throw new Error('EnrollmentPhase expected enrollment to be active');
  }

  if (!activeStep) {
    return null;
  }

  return activeStep.render();
};

export default EnrollmentPhase;
