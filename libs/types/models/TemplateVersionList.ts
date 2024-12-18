/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ListMeta } from './ListMeta';
import type { TemplateVersion } from './TemplateVersion';
/**
 * TemplateVersionList is a list of TemplateVersions.
 */
export type TemplateVersionList = {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources.
   */
  apiVersion: string;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds.
   */
  kind: string;
  metadata: ListMeta;
  /**
   * List of TemplateVersions.
   */
  items: Array<TemplateVersion>;
};

