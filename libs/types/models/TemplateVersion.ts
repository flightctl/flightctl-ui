/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiVersion } from './ApiVersion';
import type { ObjectMeta } from './ObjectMeta';
import type { TemplateVersionSpec } from './TemplateVersionSpec';
import type { TemplateVersionStatus } from './TemplateVersionStatus';
/**
 * TemplateVersion represents a version of a template.
 */
export type TemplateVersion = {
  apiVersion: ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds.
   */
  kind: string;
  metadata: ObjectMeta;
  spec: TemplateVersionSpec;
  status?: TemplateVersionStatus;
};

