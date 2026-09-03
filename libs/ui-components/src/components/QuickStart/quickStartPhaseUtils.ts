import type { PhaseCardStatus, QuickStartPersistedState, QuickStartPhaseDefinition, QuickStartPhaseId } from './types';

export const isPhaseComplete = (phaseId: QuickStartPhaseId, persisted: QuickStartPersistedState): boolean =>
  persisted.completedPhases.includes(phaseId);

export const isPhaseLocked = (
  phaseIndex: number,
  visiblePhases: QuickStartPhaseDefinition[],
  persisted: QuickStartPersistedState,
): boolean => {
  if (phaseIndex === 0) {
    return false;
  }

  const previousPhase = visiblePhases[phaseIndex - 1];
  return !isPhaseComplete(previousPhase.id, persisted);
};

export const getPhaseStatus = (
  phaseId: QuickStartPhaseId,
  phaseIndex: number,
  visiblePhases: QuickStartPhaseDefinition[],
  persisted: QuickStartPersistedState,
  activePhaseId: QuickStartPhaseId | null = null,
): PhaseCardStatus => {
  if (isPhaseLocked(phaseIndex, visiblePhases, persisted)) {
    return 'locked';
  }
  if (isPhaseComplete(phaseId, persisted)) {
    return 'complete';
  }
  if (activePhaseId === phaseId || persisted.phaseProgress[phaseId] !== undefined) {
    return 'in-progress';
  }
  return 'not-started';
};
