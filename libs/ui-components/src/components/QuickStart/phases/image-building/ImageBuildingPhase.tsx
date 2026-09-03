import * as React from 'react';

import { ResourceKind as ImageBuilderResourceKind } from '@flightctl/types/imagebuilder';
import { useAppContext } from '../../../../hooks/useAppContext';
import { ROUTE } from '../../../../hooks/useNavigate';
import { usePermissionsContext } from '../../../common/PermissionsContext';
import { pathMatchesRoute } from '../../guide/quickStartGuideHelpers';
import { buildImageBuildingGuideSteps } from './imageBuildingGuideSteps';
import { useQuickStartGuide } from '../../QuickStartContext';
import { useQuickStartListHasItems } from '../../useQuickStartListHasItems';

const ImageBuildingPhase = () => {
  const { checkPermissions } = usePermissionsContext();
  const { router } = useAppContext();
  const location = router.useLocation();
  const { activePhaseId, activeStepIndex, setStepIndex, setGuidePresentation, setGuideActions, completePhase } =
    useQuickStartGuide();

  const isOnBuildsPage = pathMatchesRoute(location.pathname, router.appRoutes[ROUTE.IMAGE_BUILDS]);
  const { hasItems: hasBuilds } = useQuickStartListHasItems(ImageBuilderResourceKind.IMAGE_BUILD);

  const steps = React.useMemo(
    () =>
      buildImageBuildingGuideSteps({
        checkPermissions,
        isOnBuildsPage,
        hasBuilds,
      }),
    [checkPermissions, hasBuilds, isOnBuildsPage],
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
      canGoNext: activeStep.mustBeOnListPage ? isOnBuildsPage : true,
      isLastStep: activeStepIndex >= steps.length - 1,
    });
  }, [activeStep, activeStepIndex, setGuidePresentation, isOnBuildsPage, steps.length]);

  React.useEffect(() => {
    if (!activeStep) {
      setGuideActions(null);
      return;
    }
    setGuideActions({ onBack, onNext });
    return () => setGuideActions(null);
  }, [activeStep, onBack, onNext, setGuideActions]);

  if (activePhaseId !== 'build-image') {
    throw new Error('ImageBuildingPhase expected image-building to be active');
  }

  if (!activeStep) {
    return null;
  }

  return activeStep.render();
};

export default ImageBuildingPhase;
