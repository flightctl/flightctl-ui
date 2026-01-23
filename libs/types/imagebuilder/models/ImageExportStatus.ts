/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageExportCondition } from './ImageExportCondition';
/**
 * ImageExportStatus represents the current status of an ImageExport.
 */
export type ImageExportStatus = {
  /**
   * Current conditions of the ImageExport.
   */
  conditions?: Array<ImageExportCondition>;
  /**
   * The digest of the exported image manifest for this format.
   */
  manifestDigest?: string;
  /**
   * The last time the export was seen (heartbeat).
   */
  lastSeen?: string;
};

