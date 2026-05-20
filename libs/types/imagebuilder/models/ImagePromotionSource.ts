/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExportFormatType } from './ExportFormatType';
/**
 * Identifies the artifact(s) to publish.
 */
export type ImagePromotionSource = {
  /**
   * Name of the ImageBuild resource this promotion is linked to. The container/bootc artifact produced by this build is always included in the CatalogItem version entry.
   */
  imageBuildRef: string;
  /**
   * Optional list of additional artifact formats to include in the CatalogItem version entry. The promotion waits in WaitingForArtifacts until at least one successful ImageExport exists for every requested format.
   */
  exportFormats?: Array<ExportFormatType>;
};

