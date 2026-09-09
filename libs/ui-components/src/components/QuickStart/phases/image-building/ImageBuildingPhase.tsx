import * as React from 'react';

import { ResourceKind as ImageBuilderResourceKind } from '@flightctl/types/imagebuilder';
import { useAppContext } from '../../../../hooks/useAppContext';
import { ROUTE } from '../../../../hooks/useNavigate';
import { usePermissionsContext } from '../../../common/PermissionsContext';
import { pathMatchesRoute } from '../../quickStartPhaseUtils';
import { useQuickStartGuide } from '../../QuickStartContext';
import { useQuickStartListHasItems } from '../../useQuickStartListHasItems';
import { buildImageBuildingGuideSteps } from './imageBuildingGuideSteps';
import { RESOURCE, VERB } from '../../../../types/rbac';

const listPermissions = [{ kind: RESOURCE.IMAGE_BUILD, verb: VERB.LIST }];

const ImageBuildingPhase = () => {
  const { checkPermissions } = usePermissionsContext();
  const { router } = useAppContext();
  const location = router.useLocation();
  const { activePhaseId, activeStepIndex, setStepIndex, setGuidePresentation, setGuideActions, completePhase } =
    useQuickStartGuide();

  const [canListBuilds] = checkPermissions(listPermissions);
  const isOnBuildsPage = pathMatchesRoute(location.pathname, router.appRoutes[ROUTE.IMAGE_BUILDS]);
  const buildsProbe = useQuickStartListHasItems(canListBuilds ? ImageBuilderResourceKind.IMAGE_BUILD : undefined);
  const isListProbeLoading = canListBuilds && buildsProbe.isLoading;

  const steps = React.useMemo(() => {
    if (isListProbeLoading) {
      return [];
    }
    return buildImageBuildingGuideSteps({
      checkPermissions,
      isOnBuildsPage,
      hasBuilds: buildsProbe.hasItems,
    });
  }, [buildsProbe.hasItems, checkPermissions, isListProbeLoading, isOnBuildsPage]);

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
    setStepIndex(Math.max(activeStepIndex - 1, 0));
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
      canGoNext: activeStep.mustBeOnListPage ? isOnBuildsPage : true,
      isLastStep: activeStepIndex >= steps.length - 1,
    });
  }, [activeStep, activeStepIndex, isListProbeLoading, setGuidePresentation, isOnBuildsPage, steps.length]);

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

  if (activePhaseId !== 'build-image') {
    throw new Error('ImageBuildingPhase expected to be active');
  }

  if (isListProbeLoading || !activeStep) {
    return null;
  }

  return activeStep.render();
};

export default ImageBuildingPhase;
