import {
  DEFAULT_QUICK_START_STATE,
  type PanelVisibility,
  type QuickStartPersistedState,
  type QuickStartPhaseId,
} from './types';
import { QUICK_START_PHASE_IDS } from './quickStartDefinitions';

const QUICK_START_STORAGE_KEY_PREFIX = 'flightctl/quickstart-state';

const getQuickStartStorageKey = (keySuffix: string): string =>
  `${QUICK_START_STORAGE_KEY_PREFIX}/${encodeURIComponent(keySuffix)}`;

const isPanelVisibility = (value: unknown): value is PanelVisibility =>
  value === 'expanded' || value === 'collapsed' || value === 'hidden';

const isQuickStartPhaseId = (value: unknown): value is QuickStartPhaseId =>
  typeof value === 'string' && (QUICK_START_PHASE_IDS as readonly string[]).includes(value);

const parseCompletedPhases = (value: unknown): QuickStartPhaseId[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isQuickStartPhaseId);
};

const parsePhaseProgress = (value: unknown): QuickStartPersistedState['phaseProgress'] => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const progress: QuickStartPersistedState['phaseProgress'] = {};
  for (const [key, entry] of Object.entries(value)) {
    if (!isQuickStartPhaseId(key)) {
      continue;
    }
    if (!entry || typeof entry !== 'object') {
      continue;
    }
    const lastStepIndex = (entry as { lastStepIndex?: unknown }).lastStepIndex;
    if (typeof lastStepIndex === 'number' && lastStepIndex >= 0) {
      progress[key] = { lastStepIndex };
    }
  }
  return progress;
};

export const getPersistedQuickStartState = (keySuffix: string): QuickStartPersistedState => {
  if (!keySuffix) {
    return DEFAULT_QUICK_START_STATE;
  }

  try {
    const stored = window.localStorage.getItem(getQuickStartStorageKey(keySuffix));
    if (!stored) {
      return DEFAULT_QUICK_START_STATE;
    }

    const parsed = JSON.parse(stored) as Partial<QuickStartPersistedState>;

    if (isPanelVisibility(parsed.panelVisibility)) {
      return {
        panelVisibility: parsed.panelVisibility,
        completedPhases: parseCompletedPhases(parsed.completedPhases),
        phaseProgress: parsePhaseProgress(parsed.phaseProgress),
      };
    }
  } catch {
    // Fall through to defaults.
  }

  return DEFAULT_QUICK_START_STATE;
};

export const persistQuickStartState = (keySuffix: string, state: QuickStartPersistedState): void => {
  if (!keySuffix) {
    return;
  }

  try {
    window.localStorage.setItem(getQuickStartStorageKey(keySuffix), JSON.stringify(state));
  } catch {
    // Fall through — in-memory state still works; preference won't survive reload.
  }
};
