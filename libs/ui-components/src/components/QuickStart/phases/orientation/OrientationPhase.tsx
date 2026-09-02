import * as React from 'react';

import { useQuickStartGuide } from '../../QuickStartContext';
import ProductStep from './steps/ProductStep';
import NavStep from './steps/NavStep';
import OverviewStep from './steps/OverviewStep';

export const ORIENTATION_STEP_COUNT = 3;

const OrientationPhase = () => {
  const { activePhaseId, activeStepIndex, setStepIndex, setGuidePresentation, setGuideActions, completePhase } =
    useQuickStartGuide();

  const isLastStep = activeStepIndex >= ORIENTATION_STEP_COUNT - 1;

  const onNext = React.useCallback(() => {
    if (isLastStep) {
      completePhase();
      return;
    }
    setStepIndex(activeStepIndex + 1);
  }, [activeStepIndex, completePhase, isLastStep, setStepIndex]);

  const onBack = React.useCallback(() => {
    setStepIndex(activeStepIndex - 1);
  }, [activeStepIndex, setStepIndex]);

  React.useEffect(() => {
    setGuidePresentation({
      totalSteps: ORIENTATION_STEP_COUNT,
      canGoBack: activeStepIndex > 0,
      canGoNext: true,
      isLastStep,
    });
  }, [activeStepIndex, isLastStep, setGuidePresentation]);

  React.useEffect(() => {
    setGuideActions({ onBack, onNext });
    return () => setGuideActions(null);
  }, [onBack, onNext, setGuideActions]);

  if (activePhaseId !== 'orientation') {
    throw new Error('OrientationPhase expected orientation to be active');
  }

  switch (activeStepIndex) {
    case 0:
      return <ProductStep />;
    case 1:
      return <NavStep />;
    case 2:
      return <OverviewStep />;
    default:
      return null;
  }
};

export default OrientationPhase;
