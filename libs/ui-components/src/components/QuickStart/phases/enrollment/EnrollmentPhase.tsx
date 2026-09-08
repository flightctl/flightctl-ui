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
  const devicesProbe = useQuickStartListHasItems(canListDevices ? ResourceKind.DEVICE : undefined);
  const pendingProbe = useQuickStartListHasItems(
    canListEnrollmentRequests ? ResourceKind.ENROLLMENT_REQUEST : undefined,
  );
  const isListProbeLoading =
    (canListDevices && devicesProbe.isLoading) || (canListEnrollmentRequests && pendingProbe.isLoading);
  const isOnDevicesPage = pathMatchesRoute(location.pathname, router.appRoutes[ROUTE.DEVICES]);

  const steps = React.useMemo(() => {
    if (isListProbeLoading) {
      return [];
    }
    return buildEnrollmentGuideSteps({
      isStepActionCompleted: (stepIndex) => completedNavigationSteps[stepIndex] ?? false,
      checkPermissions,
      isOnDevicesPage,
      hasDevices: devicesProbe.hasItems,
      hasPendingDevices: pendingProbe.hasItems,
    });
  }, [
    checkPermissions,
    completedNavigationSteps,
    devicesProbe.hasItems,
    isListProbeLoading,
    isOnDevicesPage,
    pendingProbe.hasItems,
  ]);

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
    if (isListProbeLoading) {
      return;
    }
    if (!activeStep) {
      return;
    }
    setGuidePresentation({
      totalSteps: steps.length,
      canGoBack: activeStepIndex > 0,
      canGoNext: activeStep.mustBeOnListPage ? isOnDevicesPage : true,
      isLastStep: activeStepIndex >= steps.length - 1,
    });
  }, [activeStep, activeStepIndex, isListProbeLoading, setGuidePresentation, isOnDevicesPage, steps.length]);

  React.useEffect(() => {
    if (isListProbeLoading) {
      setGuideActions(null);
      return;
    }
    if (!activeStep) {
      setGuideActions(null);
      return;
    }
    setGuideActions({ onBack, onNext });
    return () => setGuideActions(null);
  }, [activeStep, isListProbeLoading, onBack, onNext, setGuideActions]);

  if (activePhaseId !== 'enroll-device') {
    throw new Error('EnrollmentPhase expected enrollment to be active');
  }

  if (isListProbeLoading || !activeStep) {
    return null;
  }

  return activeStep.render();
};

export default EnrollmentPhase;
