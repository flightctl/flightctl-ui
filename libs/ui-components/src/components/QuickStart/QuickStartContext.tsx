import * as React from 'react';

import { usePermissionsContext } from '../common/PermissionsContext';
import { quickStartPhaseDefinitions } from './quickStartDefinitions';
import { getPhaseStepCount } from './quickStartPhaseRegistry';
import { getPhaseStatus, isPhaseComplete } from './quickStartPhaseUtils';
import { getPersistedQuickStartState, persistQuickStartState } from './quickStartStorage';
import {
  DEFAULT_GUIDE_PRESENTATION,
  type PanelVisibility,
  type QuickStartGuideActions,
  type QuickStartGuidePresentation,
  type QuickStartPersistedState,
  type QuickStartPhase,
  type QuickStartPhaseId,
} from './types';
import { VERB } from '../../types/rbac';

export type QuickStartPanelValue = {
  panelVisibility: PanelVisibility;
  phases: QuickStartPhase[];
  totalPhaseCount: number;
  totalMinutes: number;
  completedPhases: QuickStartPhaseId[];
  activePhaseId: QuickStartPhaseId | null;
  activeStepIndex: number;
  toggleVisibility: VoidFunction;
  toggleCollapsed: VoidFunction;
  startPhase: (phaseId: QuickStartPhaseId) => void;
};

export type QuickStartPhaseSessionValue = {
  activeStepIndex: number;
  isGuideMinimized: boolean;
  setStepIndex: (stepIndex: number) => void;
  setGuideMinimized: (minimized: boolean) => void;
  setGuidePresentation: (patch: Partial<QuickStartGuidePresentation>) => void;
  setGuideActions: (actions: QuickStartGuideActions | null) => void;
  completePhase: VoidFunction;
  cancelPhase: VoidFunction;
};

export type QuickStartGuideValue = QuickStartPhaseSessionValue & {
  activePhaseId: QuickStartPhaseId | null;
  guidePresentation: QuickStartGuidePresentation;
  guideActions: QuickStartGuideActions | null;
};

type QuickStartStoreValue = QuickStartPanelValue &
  QuickStartPhaseSessionValue & {
    guidePresentation: QuickStartGuidePresentation;
    guideActions: QuickStartGuideActions | null;
  };

const QuickStartContext = React.createContext<QuickStartStoreValue | null>(null);

const useQuickStartStore = (): QuickStartStoreValue => {
  const context = React.useContext(QuickStartContext);
  if (!context) {
    throw new Error('useQuickStart must be used within a QuickStartProvider');
  }
  return context;
};

export const useQuickStart = (): QuickStartPanelValue => {
  const store = useQuickStartStore();
  return {
    panelVisibility: store.panelVisibility,
    phases: store.phases,
    totalPhaseCount: store.totalPhaseCount,
    totalMinutes: store.totalMinutes,
    completedPhases: store.completedPhases,
    activePhaseId: store.activePhaseId,
    activeStepIndex: store.activeStepIndex,
    toggleVisibility: store.toggleVisibility,
    toggleCollapsed: store.toggleCollapsed,
    startPhase: store.startPhase,
  };
};

/** Guide tree API — panel code should use useQuickStart() instead. */
export const useQuickStartGuide = (): QuickStartGuideValue => {
  const store = useQuickStartStore();
  return {
    activePhaseId: store.activePhaseId,
    activeStepIndex: store.activeStepIndex,
    guidePresentation: store.guidePresentation,
    guideActions: store.guideActions,
    isGuideMinimized: store.isGuideMinimized,
    setStepIndex: store.setStepIndex,
    setGuideMinimized: store.setGuideMinimized,
    setGuidePresentation: store.setGuidePresentation,
    setGuideActions: store.setGuideActions,
    completePhase: store.completePhase,
    cancelPhase: store.cancelPhase,
  };
};

export const QuickStartProvider = ({ children }: React.PropsWithChildren) => {
  const { checkPermissions } = usePermissionsContext();

  const { visiblePhases, phasesStepCounts, totalMinutes } = React.useMemo(() => {
    const visiblePhases = quickStartPhaseDefinitions.filter((phase) => {
      if (phase.listResourceNeeded === null) {
        return true;
      }
      return checkPermissions([{ kind: phase.listResourceNeeded, verb: VERB.LIST }])[0];
    });

    let minutesAcc = 0;
    const stepCounts = visiblePhases.reduce(
      (acc, phase) => {
        minutesAcc += phase.estimatedMinutes;
        acc[phase.id] = getPhaseStepCount(phase.id, checkPermissions);
        return acc;
      },
      {} as Record<QuickStartPhaseId, number>,
    );
    return { visiblePhases, phasesStepCounts: stepCounts, totalMinutes: minutesAcc };
  }, [checkPermissions]);

  const [persisted, setPersisted] = React.useState<QuickStartPersistedState>(getPersistedQuickStartState);
  const [activePhaseId, setActivePhaseId] = React.useState<QuickStartPhaseId | null>(null);
  const [activeStepIndex, setActiveStepIndex] = React.useState(0);
  const [isGuideMinimized, setIsGuideMinimized] = React.useState(false);
  const [guidePresentation, setGuidePresentationState] =
    React.useState<QuickStartGuidePresentation>(DEFAULT_GUIDE_PRESENTATION);
  const [guideActions, setGuideActionsState] = React.useState<QuickStartGuideActions | null>(null);

  const phases = React.useMemo<QuickStartPhase[]>(() => {
    return visiblePhases.map((definition, index) => {
      return {
        ...definition,
        stepCount: phasesStepCounts[definition.id] ?? 0,
        status: getPhaseStatus(definition.id, index, visiblePhases, persisted, activePhaseId),
      };
    });
  }, [activePhaseId, persisted, phasesStepCounts, visiblePhases]);

  const updatePersisted = React.useCallback((updater: (prev: QuickStartPersistedState) => QuickStartPersistedState) => {
    setPersisted((prev) => {
      const next = updater(prev);
      persistQuickStartState(next);
      return next;
    });
  }, []);

  const resetGuidePresentation = React.useCallback(() => {
    setGuidePresentationState(DEFAULT_GUIDE_PRESENTATION);
  }, []);

  const setGuidePresentation = React.useCallback((patch: Partial<QuickStartGuidePresentation>) => {
    setGuidePresentationState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setGuideActions = React.useCallback((actions: QuickStartGuideActions | null) => {
    setGuideActionsState(actions);
  }, []);

  const clearGuideSession = React.useCallback(() => {
    setActivePhaseId(null);
    setActiveStepIndex(0);
    setIsGuideMinimized(false);
    resetGuidePresentation();
    setGuideActionsState(null);
  }, [resetGuidePresentation]);

  const toggleVisibility = React.useCallback(() => {
    updatePersisted((prev) => ({
      ...prev,
      panelVisibility: prev.panelVisibility === 'hidden' ? 'expanded' : 'hidden',
    }));
    clearGuideSession();
  }, [clearGuideSession, updatePersisted]);

  const toggleCollapsed = React.useCallback(() => {
    updatePersisted((prev) => ({
      ...prev,
      panelVisibility: prev.panelVisibility === 'collapsed' ? 'expanded' : 'collapsed',
    }));
  }, [updatePersisted]);

  const startPhase = React.useCallback(
    (phaseId: QuickStartPhaseId) => {
      const phase = phases.find((entry) => entry.id === phaseId);
      if (!phase || phase.status === 'locked') {
        return;
      }

      const savedIndex = persisted.phaseProgress[phaseId]?.lastStepIndex ?? 0;
      const stepIndex = isPhaseComplete(phaseId, persisted)
        ? 0
        : Math.min(savedIndex, Math.max(phase.stepCount - 1, 0));

      setActivePhaseId(phaseId);
      setActiveStepIndex(stepIndex);
      setIsGuideMinimized(false);
      resetGuidePresentation();
      setGuideActionsState(null);
      updatePersisted((prev) => ({
        ...prev,
        phaseProgress: {
          ...prev.phaseProgress,
          [phaseId]: { lastStepIndex: stepIndex },
        },
      }));
    },
    [persisted, phases, resetGuidePresentation, updatePersisted],
  );

  const setStepIndex = React.useCallback(
    (stepIndex: number) => {
      if (!activePhaseId) {
        return;
      }

      setActiveStepIndex(stepIndex);
      setGuidePresentation({ stepTitle: null });
      updatePersisted((prev) => ({
        ...prev,
        phaseProgress: {
          ...prev.phaseProgress,
          [activePhaseId]: { lastStepIndex: stepIndex },
        },
      }));
    },
    [activePhaseId, setGuidePresentation, updatePersisted],
  );

  const cancelPhase = React.useCallback(() => {
    if (activePhaseId) {
      updatePersisted((prev) => ({
        ...prev,
        phaseProgress: {
          ...prev.phaseProgress,
          [activePhaseId]: { lastStepIndex: activeStepIndex },
        },
      }));
    }
    clearGuideSession();
  }, [activePhaseId, activeStepIndex, clearGuideSession, updatePersisted]);

  const setGuideMinimized = React.useCallback((minimized: boolean) => {
    setIsGuideMinimized(minimized);
  }, []);

  const completePhase = React.useCallback(() => {
    if (!activePhaseId) {
      return;
    }

    updatePersisted((prev) => {
      const completedPhases = prev.completedPhases.includes(activePhaseId)
        ? prev.completedPhases
        : [...prev.completedPhases, activePhaseId];
      const remainingProgress = { ...prev.phaseProgress };
      delete remainingProgress[activePhaseId];
      return {
        ...prev,
        completedPhases,
        phaseProgress: remainingProgress,
      };
    });
    clearGuideSession();
  }, [activePhaseId, clearGuideSession, updatePersisted]);

  const value = React.useMemo<QuickStartStoreValue>(
    () => ({
      panelVisibility: persisted.panelVisibility,
      phases,
      totalPhaseCount: phases.length,
      totalMinutes: totalMinutes,
      completedPhases: persisted.completedPhases,
      activePhaseId,
      activeStepIndex,
      guidePresentation,
      guideActions,
      isGuideMinimized,
      toggleVisibility,
      toggleCollapsed,
      startPhase,
      setStepIndex,
      setGuideMinimized,
      setGuidePresentation,
      setGuideActions,
      completePhase,
      cancelPhase,
    }),
    [
      persisted.panelVisibility,
      persisted.completedPhases,
      phases,
      totalMinutes,
      activePhaseId,
      activeStepIndex,
      guidePresentation,
      guideActions,
      isGuideMinimized,
      toggleVisibility,
      toggleCollapsed,
      startPhase,
      setStepIndex,
      setGuideMinimized,
      setGuidePresentation,
      setGuideActions,
      completePhase,
      cancelPhase,
    ],
  );

  return <QuickStartContext.Provider value={value}>{children}</QuickStartContext.Provider>;
};
