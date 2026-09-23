/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeltaGenerationPhase } from './DeltaGenerationPhase';
/**
 * Structured details for DeltaGenerationProgress events. One event when a pair enters a phase or becomes terminal, fanned out to each waiting Fleet or standalone Device. Not a percent heartbeat.
 */
export type DeltaGenerationProgressDetails = {
  /**
   * The type of detail for discriminator purposes.
   */
  detailType: 'DeltaGenerationProgress';
  /**
   * Image repository (host/namespace/name) for this pair.
   */
  imageRepository: string;
  /**
   * Current image digest.
   */
  sourceDigest: string;
  /**
   * Target image digest.
   */
  targetDigest: string;
  /**
   * Generation row status for this pair.
   */
  generationStatus: DeltaGenerationProgressDetails.generationStatus;
  phase?: DeltaGenerationPhase;
  /**
   * Fleet only. The TemplateVersion this prepare is for.
   */
  templateVersion?: string;
  /**
   * Device only. The rendered spec hash this prepare is for.
   */
  specHash?: string;
};
export namespace DeltaGenerationProgressDetails {
  /**
   * Generation row status for this pair.
   */
  export enum generationStatus {
    DeltaGenerationProgressInProgress = 'in_progress',
    DeltaGenerationProgressSucceeded = 'succeeded',
    DeltaGenerationProgressFailed = 'failed',
    DeltaGenerationProgressRejected = 'rejected',
  }
}

