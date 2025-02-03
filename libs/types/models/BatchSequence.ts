/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Batch } from './Batch';
/**
 * BatchSequence defines the list of batches to be executed in sequence.
 */
export type BatchSequence = {
  strategy: 'BatchSequence';
  /**
   * A list of batch definitions.
   */
  sequence?: Array<Batch>;
};

