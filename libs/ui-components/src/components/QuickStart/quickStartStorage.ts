import { DEFAULT_QUICK_START_STATE, type PanelVisibility, type QuickStartPersistedState } from './types';

const QUICK_START_STORAGE_KEY = 'flightctl/quickstart-state';

const isPanelVisibility = (value: unknown): value is PanelVisibility =>
  value === 'expanded' || value === 'collapsed' || value === 'hidden';

export const getPersistedQuickStartState = (): QuickStartPersistedState => {
  try {
    const stored = window.localStorage.getItem(QUICK_START_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_QUICK_START_STATE;
    }

    const parsed = JSON.parse(stored) as Partial<QuickStartPersistedState>;

    if (isPanelVisibility(parsed.panelVisibility)) {
      return {
        panelVisibility: parsed.panelVisibility,
      };
    }
  } catch {
    // Fall through to defaults.
  }

  return DEFAULT_QUICK_START_STATE;
};

export const persistQuickStartState = (state: QuickStartPersistedState): void => {
  try {
    window.localStorage.setItem(QUICK_START_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Fall through — in-memory state still works; preference won't survive reload.
  }
};
