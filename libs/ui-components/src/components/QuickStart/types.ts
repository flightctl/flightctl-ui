import type { QuickStartPhaseId } from './quickStartDefinitions';

export type { QuickStartPhaseId } from './quickStartDefinitions';
export { QUICK_START_PHASE_ORDER } from './quickStartDefinitions';

export type PanelVisibility = 'expanded' | 'collapsed' | 'hidden';

export interface QuickStartPhase {
  id: QuickStartPhaseId;
  title: string;
  icon: string;
  description: string;
}

export interface QuickStartPersistedState {
  panelVisibility: PanelVisibility;
}

export const DEFAULT_QUICK_START_STATE: QuickStartPersistedState = {
  panelVisibility: 'expanded',
};
