/**
 * Determines if a WizardStep should be disabled.
 *
 * A step becomes disabled when any of the steps before it are invalid:
 * - This allows users to move from the last step they reached, back to previous steps.
 * - Users cannot skip ahead from an invalid step to a subsequent step.
 *
 * @example
 * // orderedStepIds: [A, B, C]. validStepIds: [A]
 * isWizardStepDisabled('A', ['A','B','C'], ['A']);      // false — A is valid
 * isWizardStepDisabled('B', ['A','B','C'], ['A']);      // false — User can access step B since A is valid.
 * isWizardStepDisabled('C', ['A','B','C'], ['A']);      // true  — User is blocked from accessing step C since B is invalid.
 */

export const isWizardStepDisabled = (stepId: string, orderedStepIds: string[], validStepIds: string[]) => {
  const stepIndex = orderedStepIds.indexOf(stepId);
  if (stepIndex <= 0) {
    return false;
  }

  // If there are any invalid steps before the current one, the current step should be disabled.
  const previousStepIds = orderedStepIds.slice(0, stepIndex);
  return previousStepIds.some((id) => !validStepIds.includes(id));
};
