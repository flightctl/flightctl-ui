import * as React from 'react';

import { ResourceKind } from '@flightctl/types';
import { useAppContext } from '../../../../hooks/useAppContext';
import { usePermissionsContext } from '../../../common/PermissionsContext';
import { useQuickStartGuide } from '../../QuickStartContext';
import { buildFleetManagementGuideSteps } from './fleetManagementGuideSteps';
import { pathMatchesRoute } from '../../quickStartPhaseUtils';
import { ROUTE } from '../../../../hooks/useNavigate';
import { useQuickStartListHasItems } from '../../useQuickStartListHasItems';
import { RESOURCE, VERB } from '../../../../types/rbac';

const listPermissions = [{ kind: RESOURCE.FLEET, verb: VERB.LIST }];

const FleetManagementPhase = () => {
  const { checkPermissions } = usePermissionsContext();
  const { router } = useAppContext();
  const location = router.useLocation();
  const { activePhaseId, activeStepIndex, setStepIndex, setGuidePresentation, setGuideActions, completePhase } =
    useQuickStartGuide();

  const [canListFleets] = checkPermissions(listPermissions);
  const fleetsProbe = useQuickStartListHasItems(canListFleets ? ResourceKind.FLEET : undefined);
  const isListProbeLoading = canListFleets && fleetsProbe.isLoading;
  const isOnFleetsPage = pathMatchesRoute(location.pathname, router.appRoutes[ROUTE.FLEETS]);

  const steps = React.useMemo(() => {
    if (isListProbeLoading) {
      return [];
    }
    return buildFleetManagementGuideSteps({
      checkPermissions,
      isOnFleetsPage,
      hasFleets: fleetsProbe.hasItems,
    });
  }, [checkPermissions, fleetsProbe.hasItems, isListProbeLoading, isOnFleetsPage]);

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
    if (isListProbeLoading) {
      return;
    }
    if (!activeStep) {
      return;
    }
    setGuidePresentation({
      totalSteps: steps.length,
      canGoBack: activeStepIndex > 0,
      canGoNext: activeStep.mustBeOnListPage ? isOnFleetsPage : true,
      isLastStep: activeStepIndex >= steps.length - 1,
    });
  }, [activeStep, activeStepIndex, isListProbeLoading, setGuidePresentation, isOnFleetsPage, steps.length]);

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

  if (activePhaseId !== 'manage-fleet') {
    throw new Error('FleetManagementPhase expected to be active');
  }

  if (isListProbeLoading || !activeStep) {
    return null;
  }

  return activeStep.render();
};

export default FleetManagementPhase;
