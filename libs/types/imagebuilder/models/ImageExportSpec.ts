/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExportFormatType } from './ExportFormatType';
import type { ImageExportDestination } from './ImageExportDestination';
import type { ImageExportSource } from './ImageExportSource';
/**
 * ImageExportSpec describes the specification for an image export.
 */
export type ImageExportSpec = {
  source: ImageExportSource;
  destination: ImageExportDestination;
  format: ExportFormatType;
  /**
   * Optional suffix to append to the output tag for this format.
   */
  tagSuffix?: string;
};

