/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ArtifactPromotionStatus = {
  /**
   * Artifact format. "container" for the ImageBuild artifact; one of the exportFormats values for additional artifacts.
   */
  format: string;
  /**
   * True when at least one successful artifact of this format is available.
   */
  ready: boolean;
  /**
   * True when this format's artifact reference has been successfully written to the CatalogItemVersion. For the initial publish, all formats are published atomically. For amendments, formats added via PATCH/PUT start as published=false and transition to published=true when their CatalogItem patch succeeds.
   */
  published: boolean;
  /**
   * Name of the ImageExport resource that will be (or was) used for this format. Absent for the container artifact and for formats not yet ready.
   */
  resolvedExport?: string;
};

