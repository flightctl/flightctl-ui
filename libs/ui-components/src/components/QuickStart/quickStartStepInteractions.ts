import type { StepInteraction } from './types';

export const IMPLEMENTED_STEP_INTERACTIONS = new Set<StepInteraction>(['informational', 'navigation', 'wizard-field']);

export const isInteractionImplemented = (interaction: StepInteraction): boolean =>
  IMPLEMENTED_STEP_INTERACTIONS.has(interaction);
