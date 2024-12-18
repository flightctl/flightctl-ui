/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LabelSelector } from './LabelSelector';
import type { Percentage } from './Percentage';
/**
 * Batch is an element in batch sequence.
 */
export type Batch = {
  selector?: LabelSelector;
  successThreshold?: Percentage;
  /**
   * The maximum number or percentage of devices to update in the batch.
   */
  limit?: (Percentage | number);
};

