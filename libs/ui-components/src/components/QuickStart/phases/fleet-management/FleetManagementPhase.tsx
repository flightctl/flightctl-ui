import * as React from 'react';

import { ResourceKind } from '@flightctl/types';
import { useAppContext } from '../../../../hooks/useAppContext';
import { usePermissionsContext } from '../../../common/PermissionsContext';
import { useQuickStartGuide } from '../../QuickStartContext';
import { buildFleetManagementGuideSteps } from './fleetManagementGuideSteps';
import { pathMatchesRoute } from '../../guide/quickStartGuideHelpers';
import { ROUTE } from '../../../../hooks/useNavigate';
import { useQuickStartListHasItems } from '../../useQuickStartListHasItems';

const FleetManagementPhase = () => {
  const { checkPermissions } = usePermissionsContext();
  const { router } = useAppContext();
  const location = router.useLocation();
  const { activePhaseId, activeStepIndex, setStepIndex, setGuidePresentation, setGuideActions, completePhase } =
    useQuickStartGuide();

  const { hasItems: hasFleets } = useQuickStartListHasItems(ResourceKind.FLEET);
  const isOnFleetsPage = pathMatchesRoute(location.pathname, router.appRoutes[ROUTE.FLEETS]);

  const steps = React.useMemo(
    () =>
      buildFleetManagementGuideSteps({
        checkPermissions,
        isOnFleetsPage,
        hasFleets,
      }),
    [checkPermissions, hasFleets, isOnFleetsPage],
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
    setStepIndex(activeStepIndex + 1);
  }, [activeStep, activeStepIndex, completePhase, isLastStep, setStepIndex]);

  const onBack = React.useCallback(() => {
    setStepIndex(activeStepIndex - 1);
  }, [activeStepIndex, setStepIndex]);

  React.useEffect(() => {
    if (!activeStep) {
      return;
    }
    setGuidePresentation({
      totalSteps: steps.length,
      canGoBack: activeStepIndex > 0,
      canGoNext: activeStep.mustBeOnListPage ? isOnFleetsPage : true,
      isLastStep: activeStepIndex >= steps.length - 1,
    });
  }, [activeStep, activeStepIndex, setGuidePresentation, isOnFleetsPage, steps.length]);

  React.useEffect(() => {
    if (!activeStep) {
      setGuideActions(null);
      return;
    }
    setGuideActions({ onBack, onNext });
    return () => setGuideActions(null);
  }, [activeStep, onBack, onNext, setGuideActions]);

  if (activePhaseId !== 'manage-fleet') {
    throw new Error('FleetManagementPhase expected fleet-management to be active');
  }

  if (!activeStep) {
    return null;
  }

  return activeStep.render();
};

export default FleetManagementPhase;
