import type * as React from 'react';

import type { QuickStartPhaseId } from './quickStartDefinitions';
import type { RESOURCE } from '../../types/rbac';

export type { QuickStartPhaseId } from './quickStartDefinitions';
export type { PermissionCheck } from '../common/PermissionsContext';
export type PanelVisibility = 'expanded' | 'collapsed' | 'hidden';
export type PhaseCardStatus = 'locked' | 'not-started' | 'in-progress' | 'complete';

export type QuickStartGuidePresentation = {
  stepTitle: React.ReactNode | null;
  totalSteps: number;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
  footerExtra?: React.ReactNode;
};

export type QuickStartGuideActions = {
  onBack: VoidFunction;
  onNext: VoidFunction;
};

export const DEFAULT_GUIDE_PRESENTATION: QuickStartGuidePresentation = {
  stepTitle: null,
  totalSteps: 0,
  canGoBack: false,
  canGoNext: false,
  isLastStep: false,
};

export type QuickStartPhaseIcon = 'home' | 'image' | 'plus' | 'cubes';

export interface QuickStartPhaseDefinition {
  id: QuickStartPhaseId;
  icon: 'home' | 'image' | 'plus' | 'cubes';
  estimatedMinutes: number;
  listResourceNeeded: RESOURCE | null;
}

export interface QuickStartPhase extends QuickStartPhaseDefinition {
  stepCount: number;
  status: PhaseCardStatus;
}

export interface QuickStartPersistedState {
  panelVisibility: PanelVisibility;
  completedPhases: QuickStartPhaseId[];
  phaseProgress: Partial<Record<QuickStartPhaseId, { lastStepIndex: number }>>;
}

export const DEFAULT_QUICK_START_STATE: QuickStartPersistedState = {
  panelVisibility: 'expanded',
  completedPhases: [],
  phaseProgress: {},
};
