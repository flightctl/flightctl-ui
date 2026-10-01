/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SystemInfoSourceStatusType } from './SystemInfoSourceStatusType';
/**
 * Collection status for a single system information source.
 */
export type SystemInfoSourceStatus = {
  status: SystemInfoSourceStatusType;
  /**
   * The last time the collection status of this source changed.
   */
  lastTransitionTime: string;
  /**
   * Human readable message providing details about the source status.
   */
  message?: string;
};

