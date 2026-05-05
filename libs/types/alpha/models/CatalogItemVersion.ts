/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CatalogItemConfigurable } from './CatalogItemConfigurable';
import type { CatalogItemDeprecation } from './CatalogItemDeprecation';
/**
 * A version of a catalog item following the Cincinnati model where versions
 * are nodes in an upgrade graph and channels are labels on those nodes.
 * Upgrade edges are defined by replaces (single), skips (multiple), or
 * skipRange (semver range). Includes CatalogItemConfigurable fields that
 * override item-level defaults.
 *
 */
export type CatalogItemVersion = (CatalogItemConfigurable & {
  /**
   * Semantic version identifier (e.g., 1.2.3, 2.0.0-rc1). Required for version ordering and upgrade graph.
   */
  version: string;
  /**
   * Map of artifact type to image tag or digest. Keys must match a type in spec.artifacts. Only keyed artifacts are available for this version.
   */
  references: Record<string, string>;
  /**
   * Channels this version belongs to.
   */
  channels: Array<string>;
  /**
   * The single version this one replaces, defining the primary upgrade edge.
   */
  replaces?: string;
  /**
   * Additional versions that can upgrade directly to this one. Use when stable channel skips intermediate fast-only versions.
   */
  skips?: Array<string>;
  /**
   * Semver range of versions that can upgrade directly to this one. Use for z-stream updates or hotfixes.
   */
  skipRange?: string;
  deprecation?: CatalogItemDeprecation;
});

