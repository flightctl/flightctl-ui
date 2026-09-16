import { describe, expect, it } from 'vitest';

import { OciAuthType, OciRepoSpec, RepoSpecType } from '@flightctl/types';

import { getOciRepositoryPatches } from './utils';
import { OciPlacementMode, type RepositoryFormValues } from './types';

const testRegistry = 'my-registry.com';
const testRepo = 'my-org/diffs';
const testNs = 'my-org';

const baseRepoSpec = (overrides?: Partial<OciRepoSpec>): OciRepoSpec => ({
  type: RepoSpecType.RepoSpecTypeOci,
  registry: testRegistry,
  accessMode: OciRepoSpec.accessMode.READ_WRITE,
  scheme: OciRepoSpec.scheme.HTTPS,
  ...overrides,
});

const baseFormValues = (overrides?: Partial<RepositoryFormValues>): RepositoryFormValues => ({
  exists: true,
  name: 'test-repo',
  repoType: RepoSpecType.RepoSpecTypeOci,
  url: '',
  showRepoTypes: true,
  allowDeltaStorage: true,
  useAdvancedConfig: false,
  configType: 'http',
  canUseResourceSyncs: false,
  useResourceSyncs: false,
  resourceSyncs: [],
  ociConfig: {
    registry: testRegistry,
    scheme: OciRepoSpec.scheme.HTTPS,
    accessMode: OciRepoSpec.accessMode.READ_WRITE,
    baseImages: [],
    deltaStorageTarget: false,
    placementMode: OciPlacementMode.Registry,
    repository: '',
    namespace: '',
  },
  ...overrides,
});

describe('getOciRepositoryPatches', () => {
  it('returns an empty array when ociConfig is missing', () => {
    const values = baseFormValues({ ociConfig: undefined });
    expect(getOciRepositoryPatches(values, baseRepoSpec())).toEqual([]);
  });

  it('returns no patches when form values match the existing spec', () => {
    const repoSpec = baseRepoSpec();
    const values = baseFormValues();
    expect(getOciRepositoryPatches(values, repoSpec)).toEqual([]);
  });

  it('patches registry, scheme, and access mode changes', () => {
    const repoSpec = baseRepoSpec();
    const values = baseFormValues({
      ociConfig: {
        ...baseFormValues().ociConfig!,
        registry: 'new-registry.com',
        scheme: OciRepoSpec.scheme.HTTP,
        accessMode: OciRepoSpec.accessMode.READ,
      },
    });

    expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
      expect.arrayContaining([
        { op: 'replace', path: '/spec/registry', value: 'new-registry.com' },
        { op: 'replace', path: '/spec/scheme', value: OciRepoSpec.scheme.HTTP },
        { op: 'replace', path: '/spec/accessMode', value: OciRepoSpec.accessMode.READ },
      ]),
    );
  });

  describe('placement', () => {
    it('adds repository when placement mode is repository', () => {
      const repoSpec = baseRepoSpec();
      const values = baseFormValues({
        ociConfig: {
          ...baseFormValues().ociConfig!,
          placementMode: OciPlacementMode.Repository,
          repository: testRepo,
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([{ op: 'add', path: '/spec/repository', value: testRepo }]),
      );
    });

    it('adds namespace when placement mode is namespace', () => {
      const repoSpec = baseRepoSpec();
      const values = baseFormValues({
        ociConfig: {
          ...baseFormValues().ociConfig!,
          placementMode: OciPlacementMode.Namespace,
          namespace: testNs,
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([{ op: 'add', path: '/spec/namespace', value: testNs }]),
      );
    });

    it('removes repository and namespace when switching to registry-only placement', () => {
      const repoSpec = baseRepoSpec({ repository: testRepo, namespace: testNs });
      const values = baseFormValues({
        ociConfig: {
          ...baseFormValues().ociConfig!,
          placementMode: OciPlacementMode.Registry,
          repository: '',
          namespace: '',
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([
          { op: 'remove', path: '/spec/repository' },
          { op: 'remove', path: '/spec/namespace' },
        ]),
      );
    });

    it('switches from repository to namespace placement', () => {
      const repoSpec = baseRepoSpec({ repository: testRepo });
      const values = baseFormValues({
        ociConfig: {
          ...baseFormValues().ociConfig!,
          placementMode: OciPlacementMode.Namespace,
          repository: '',
          namespace: testNs,
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([
          { op: 'remove', path: '/spec/repository' },
          { op: 'add', path: '/spec/namespace', value: testNs },
        ]),
      );
    });

    it('adds push placement for read-only repos that are not deltaStorageTargets', () => {
      const repoSpec = baseRepoSpec({ accessMode: OciRepoSpec.accessMode.READ });
      const values = baseFormValues({
        ociConfig: {
          ...baseFormValues().ociConfig!,
          accessMode: OciRepoSpec.accessMode.READ,
          placementMode: OciPlacementMode.Repository,
          repository: testRepo,
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([{ op: 'add', path: '/spec/repository', value: testRepo }]),
      );
    });
  });

  describe('deltaStorageTarget', () => {
    it('sets deltaStorageTarget initially', () => {
      const repoSpec = baseRepoSpec();
      const values = baseFormValues({
        ociConfig: {
          ...baseFormValues().ociConfig!,
          deltaStorageTarget: true,
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([{ op: 'add', path: '/spec/deltaStorageTarget', value: true }]),
      );
    });
    it('toggles deltaStorageTarget on', () => {
      const repoSpec = baseRepoSpec({ deltaStorageTarget: false });
      const values = baseFormValues({
        ociConfig: {
          ...baseFormValues().ociConfig!,
          deltaStorageTarget: true,
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([{ op: 'replace', path: '/spec/deltaStorageTarget', value: true }]),
      );
    });

    it('toggles deltaStorageTarget off', () => {
      const repoSpec = baseRepoSpec({ deltaStorageTarget: true });
      const values = baseFormValues({
        ociConfig: {
          ...baseFormValues().ociConfig!,
          deltaStorageTarget: false,
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([{ op: 'replace', path: '/spec/deltaStorageTarget', value: false }]),
      );
    });

    it('sets deltaStorageTarget to false when allowDeltaStorage is disabled', () => {
      const repoSpec = baseRepoSpec({ deltaStorageTarget: true });
      const values = baseFormValues({
        allowDeltaStorage: false,
        ociConfig: {
          ...baseFormValues().ociConfig!,
          deltaStorageTarget: true,
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([{ op: 'replace', path: '/spec/deltaStorageTarget', value: false }]),
      );
    });

    it('disables deltaStorageTarget and removes placement paths', () => {
      const repoSpec = baseRepoSpec({ deltaStorageTarget: true, repository: testRepo });
      const values = baseFormValues({
        ociConfig: {
          ...baseFormValues().ociConfig!,
          deltaStorageTarget: false,
          placementMode: OciPlacementMode.Registry,
          repository: '',
          namespace: '',
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([
          { op: 'replace', path: '/spec/deltaStorageTarget', value: false },
          { op: 'remove', path: '/spec/repository' },
        ]),
      );
    });
  });

  describe('base images', () => {
    const baseImage = { displayName: 'Base', imageName: 'my-org/base', tags: ['latest'] };

    it('removes baseImages when cleared from the form', () => {
      const repoSpec = baseRepoSpec({ baseImages: [baseImage] });
      const values = baseFormValues({
        ociConfig: {
          ...baseFormValues().ociConfig!,
          baseImages: [],
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([{ op: 'remove', path: '/spec/baseImages' }]),
      );
    });

    it('adds baseImages when newly set', () => {
      const repoSpec = baseRepoSpec();
      const values = baseFormValues({
        ociConfig: {
          ...baseFormValues().ociConfig!,
          baseImages: [baseImage],
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([{ op: 'add', path: '/spec/baseImages', value: [baseImage] }]),
      );
    });

    it('replaces baseImages when the list length changes', () => {
      const repoSpec = baseRepoSpec({ baseImages: [baseImage] });
      const updatedImages = [baseImage, { displayName: 'Other', imageName: 'my-org/other', tags: ['v1'] }];
      const values = baseFormValues({
        ociConfig: {
          ...baseFormValues().ociConfig!,
          baseImages: updatedImages,
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([{ op: 'replace', path: '/spec/baseImages', value: updatedImages }]),
      );
    });

    it('replaces baseImages when content changes', () => {
      const repoSpec = baseRepoSpec({ baseImages: [baseImage] });
      const updatedImage = { ...baseImage, tags: ['v2'] };
      const values = baseFormValues({
        ociConfig: {
          ...baseFormValues().ociConfig!,
          baseImages: [updatedImage],
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([{ op: 'replace', path: '/spec/baseImages', value: [updatedImage] }]),
      );
    });

    it('does not patch when baseImages are unchanged', () => {
      const repoSpec = baseRepoSpec({ baseImages: [baseImage] });
      const values = baseFormValues({
        ociConfig: {
          ...baseFormValues().ociConfig!,
          baseImages: [baseImage],
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual([]);
    });
  });

  describe('advanced config disabled', () => {
    it('removes ociAuth, ca.crt, and skipServerVerification from the spec', () => {
      const repoSpec = baseRepoSpec({
        ociAuth: { authType: OciAuthType.DOCKER, username: 'user', password: 'pass' },
        'ca.crt': btoa('ca-cert'),
        skipServerVerification: true,
      });
      const values = baseFormValues({ useAdvancedConfig: false });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([
          { op: 'remove', path: '/spec/ociAuth' },
          { op: 'remove', path: '/spec/ca.crt' },
          { op: 'remove', path: '/spec/skipServerVerification' },
        ]),
      );
    });
  });

  describe('advanced config enabled', () => {
    it('patches skipServerVerification and ca.crt', () => {
      const repoSpec = baseRepoSpec();
      const values = baseFormValues({
        useAdvancedConfig: true,
        ociConfig: {
          ...baseFormValues().ociConfig!,
          skipServerVerification: true,
          caCrt: 'ca-cert',
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([
          { op: 'add', path: '/spec/skipServerVerification', value: true },
          { op: 'add', path: '/spec/ca.crt', value: btoa('ca-cert') },
        ]),
      );
    });

    it('removes ca.crt when skipServerVerification is enabled and spec has a certificate', () => {
      const repoSpec = baseRepoSpec({ 'ca.crt': btoa('old-cert') });
      const values = baseFormValues({
        useAdvancedConfig: true,
        ociConfig: {
          ...baseFormValues().ociConfig!,
          skipServerVerification: true,
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([
          { op: 'add', path: '/spec/skipServerVerification', value: true },
          { op: 'remove', path: '/spec/ca.crt' },
        ]),
      );
    });

    it('adds ociAuth when credentials are provided', () => {
      const repoSpec = baseRepoSpec();
      const values = baseFormValues({
        useAdvancedConfig: true,
        ociConfig: {
          ...baseFormValues().ociConfig!,
          ociAuth: { use: true, username: 'user', password: 'pass' },
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([
          {
            op: 'add',
            path: '/spec/ociAuth',
            value: { authType: OciAuthType.DOCKER, username: 'user', password: 'pass' },
          },
        ]),
      );
    });

    it('patches ociAuth username and password when they change', () => {
      const repoSpec = baseRepoSpec({
        ociAuth: { authType: OciAuthType.DOCKER, username: 'old-user', password: 'old-pass' },
      });
      const values = baseFormValues({
        useAdvancedConfig: true,
        ociConfig: {
          ...baseFormValues().ociConfig!,
          ociAuth: { use: true, username: 'new-user', password: 'new-pass' },
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([
          { op: 'replace', path: '/spec/ociAuth/username', value: 'new-user' },
          { op: 'replace', path: '/spec/ociAuth/password', value: 'new-pass' },
        ]),
      );
    });

    it('removes ociAuth when credentials are cleared', () => {
      const repoSpec = baseRepoSpec({
        ociAuth: { authType: OciAuthType.DOCKER, username: 'user', password: 'pass' },
      });
      const values = baseFormValues({
        useAdvancedConfig: true,
        ociConfig: {
          ...baseFormValues().ociConfig!,
          ociAuth: { use: false },
        },
      });

      expect(getOciRepositoryPatches(values, repoSpec)).toEqual(
        expect.arrayContaining([{ op: 'remove', path: '/spec/ociAuth' }]),
      );
    });
  });
});
