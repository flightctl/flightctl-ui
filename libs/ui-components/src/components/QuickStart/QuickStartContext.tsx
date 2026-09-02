import * as React from 'react';

import { getQuickStartPhases } from './quickStartDefinitions';
import { getPersistedQuickStartState, persistQuickStartState } from './quickStartStorage';
import { useTranslation } from '../../hooks/useTranslation';
import { useQuickStartProductName } from './useQuickStartProductName';
import {
  type PanelVisibility,
  type QuickStartPersistedState,
  type QuickStartPhase,
  type QuickStartPhaseId,
} from './types';

interface QuickStartGuideActions {
  startPhase: (phaseId: QuickStartPhaseId) => void;
  cancelPhase: VoidFunction;
  setGuideMinimized: (minimized: boolean) => void;
}

export type QuickStartPanelValue = {
  panelVisibility: PanelVisibility;
  phases: QuickStartPhase[];
  toggleVisibility: VoidFunction;
  toggleCollapsed: VoidFunction;
  startPhase: (phaseId: QuickStartPhaseId) => void;
};

export type QuickStartGuideValue = QuickStartGuideActions & {
  activePhase: QuickStartPhase | null;
  isGuideMinimized: boolean;
};

type QuickStartStoreValue = QuickStartPanelValue &
  QuickStartGuideActions & {
    activePhaseId: QuickStartPhaseId | null;
    isGuideMinimized: boolean;
    phases: QuickStartPhase[];
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
  const { panelVisibility, phases, toggleVisibility, toggleCollapsed, startPhase } = useQuickStartStore();

  return {
    panelVisibility,
    phases,
    toggleVisibility,
    toggleCollapsed,
    startPhase,
  };
};

export const useQuickStartGuide = (): QuickStartGuideValue => {
  const { activePhaseId, isGuideMinimized, phases, startPhase, cancelPhase, setGuideMinimized } = useQuickStartStore();

  const activePhase = activePhaseId ? phases.find((phase) => phase.id === activePhaseId) ?? null : null;

  return {
    activePhase,
    isGuideMinimized,
    startPhase,
    cancelPhase,
    setGuideMinimized,
  };
};

interface QuickStartProviderProps {
  children: React.ReactNode;
}

export const QuickStartProvider = ({ children }: QuickStartProviderProps) => {
  const { t } = useTranslation();
  const productName = useQuickStartProductName();
  const phases = React.useMemo(() => getQuickStartPhases(t, productName), [t, productName]);

  const [persisted, setPersisted] = React.useState<QuickStartPersistedState>(getPersistedQuickStartState);
  const [activePhaseId, setActivePhaseId] = React.useState<QuickStartPhaseId | null>(null);
  const [isGuideMinimized, setIsGuideMinimized] = React.useState(false);

  const updatePersisted = React.useCallback((updater: (prev: QuickStartPersistedState) => QuickStartPersistedState) => {
    setPersisted((prev) => {
      const next = updater(prev);
      persistQuickStartState(next);
      return next;
    });
  }, []);

  const clearGuideSession = React.useCallback(() => {
    setActivePhaseId(null);
    setIsGuideMinimized(false);
  }, []);

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
      const firstPhaseId = phases[0]?.id;
      if (!firstPhaseId || phaseId !== firstPhaseId) {
        return;
      }
      setActivePhaseId(phaseId);
      setIsGuideMinimized(false);
    },
    [phases],
  );

  const cancelPhase = React.useCallback(() => {
    clearGuideSession();
  }, [clearGuideSession]);

  const setGuideMinimized = React.useCallback((minimized: boolean) => {
    setIsGuideMinimized(minimized);
  }, []);

  const value = React.useMemo<QuickStartStoreValue>(
    () => ({
      panelVisibility: persisted.panelVisibility,
      toggleVisibility,
      toggleCollapsed,
      activePhaseId,
      isGuideMinimized,
      phases,
      startPhase,
      cancelPhase,
      setGuideMinimized,
    }),
    [
      persisted,
      toggleVisibility,
      toggleCollapsed,
      activePhaseId,
      isGuideMinimized,
      phases,
      startPhase,
      cancelPhase,
      setGuideMinimized,
    ],
  );

  return <QuickStartContext.Provider value={value}>{children}</QuickStartContext.Provider>;
};
