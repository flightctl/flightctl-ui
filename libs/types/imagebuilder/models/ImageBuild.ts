/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ObjectMeta } from '../../models/ObjectMeta';
import type { ImageBuildSpec } from './ImageBuildSpec';
import type { ImageBuildStatus } from './ImageBuildStatus';
import type { ImageExport } from './ImageExport';
/**
 * ImageBuild represents a build request for a container image.
 */
export type ImageBuild = {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources.
   */
  apiVersion: string;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds.
   */
  kind: string;
  metadata: ObjectMeta;
  spec: ImageBuildSpec;
  status?: ImageBuildStatus;
  /**
   * Array of ImageExport resources that reference this ImageBuild. Only populated when withExports query parameter is true.
   */
  imageexports?: Array<ImageExport>;
};

