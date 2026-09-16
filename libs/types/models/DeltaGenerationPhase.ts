/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Current step of control-plane delta generation for the in-flight pair.
 */
export enum DeltaGenerationPhase {
  DeltaGenerationPhaseCheckingExisting = 'checkingExisting',
  DeltaGenerationPhasePullSource = 'pullSource',
  DeltaGenerationPhasePullTarget = 'pullTarget',
  DeltaGenerationPhaseCreateDelta = 'createDelta',
  DeltaGenerationPhasePush = 'push',
}
