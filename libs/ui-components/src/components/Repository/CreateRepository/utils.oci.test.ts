import { describe, expect, it } from 'vitest';

import { ApiVersion, OciRepoSpec, RepoSpecType, type Repository } from '@flightctl/types';

import {
  getInitValues,
  getOciPlacementModeFromSpec,
  getOciRepoDisplayPath,
  getRepository,
  isDuplicateDeltaTargetError,
  repositorySchema,
} from './utils';
import { OciPlacementMode, type RepositoryFormValues } from './types';

type DefinedOciConfig = NonNullable<RepositoryFormValues['ociConfig']>;

const t = (key: string) => key;

const testRegistry = 'my-registry.com';
const testRepo = 'my-org/diffs';
const testNs = 'my-org';

const getOciFormValues = (ociConfigOverrides?: Partial<DefinedOciConfig>): RepositoryFormValues => ({
  exists: false,
  name: 'delta-repo',
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
    deltaStorageTarget: true,
    placementMode: OciPlacementMode.Registry,
    repository: '',
    namespace: '',
    ...ociConfigOverrides,
  },
});

const existingDeltaRepository = (): Repository => ({
  apiVersion: ApiVersion.ApiVersionV1beta1,
  kind: 'Repository',
  metadata: { name: 'delta-repo' },
  spec: {
    type: RepoSpecType.RepoSpecTypeOci,
    registry: testRegistry,
    accessMode: OciRepoSpec.accessMode.READ_WRITE,
    deltaStorageTarget: true,
    repository: testRepo,
  },
});

describe('OCI repository utils', () => {
  it('derives placement mode from stored spec', () => {
    expect(
      getOciPlacementModeFromSpec({
        type: RepoSpecType.RepoSpecTypeOci,
        registry: testRegistry,
        repository: testRepo,
      }),
    ).toBe(OciPlacementMode.Repository);
    expect(
      getOciPlacementModeFromSpec({
        type: RepoSpecType.RepoSpecTypeOci,
        registry: testRegistry,
        namespace: testNs,
      }),
    ).toBe(OciPlacementMode.Namespace);
    expect(
      getOciPlacementModeFromSpec({
        type: RepoSpecType.RepoSpecTypeOci,
        registry: testRegistry,
      }),
    ).toBe(OciPlacementMode.Registry);
  });

  it('builds OCI display paths', () => {
    expect(
      getOciRepoDisplayPath({
        type: RepoSpecType.RepoSpecTypeOci,
        registry: testRegistry,
        repository: testRepo,
      }),
    ).toBe('my-registry.com/my-org/diffs');
  });

  it('maps delta target create payload for each placement mode', () => {
    const baseFormValues = getOciFormValues();

    expect(getRepository(baseFormValues).spec).toMatchObject({
      registry: testRegistry,
      deltaStorageTarget: true,
      accessMode: OciRepoSpec.accessMode.READ_WRITE,
    });

    expect(
      getRepository(
        getOciFormValues({
          placementMode: OciPlacementMode.Repository,
          repository: testRepo,
        }),
      ).spec,
    ).toMatchObject({
      repository: testRepo,
    });

    expect(
      getRepository(
        getOciFormValues({
          placementMode: OciPlacementMode.Namespace,
          namespace: testNs,
        }),
      ).spec,
    ).toMatchObject({
      namespace: testNs,
    });
  });

  it('omits delta storage target from getRepository when allowDeltaStorage is false', () => {
    const baseFormValues = getOciFormValues({
      placementMode: OciPlacementMode.Repository,
      repository: testRepo,
    });
    const spec = getRepository({
      ...baseFormValues,
      allowDeltaStorage: false,
    }).spec;

    expect(spec).toMatchObject({
      registry: testRegistry,
      accessMode: OciRepoSpec.accessMode.READ_WRITE,
      repository: testRepo,
    });
    expect(spec).not.toHaveProperty('deltaStorageTarget');
  });

  it('includes push placement for OCI repos that are not delta storage targets', () => {
    const spec = getRepository(
      getOciFormValues({
        deltaStorageTarget: false,
        placementMode: OciPlacementMode.Repository,
        repository: testRepo,
      }),
    ).spec;

    expect(spec).toMatchObject({
      repository: testRepo,
    });
    expect(spec).not.toHaveProperty('deltaStorageTarget');
  });

  it('round-trips delta fields in getInitValues', () => {
    const repository = existingDeltaRepository();
    const values = getInitValues({ repository });
    expect(values.ociConfig).toMatchObject({
      deltaStorageTarget: true,
      placementMode: OciPlacementMode.Repository,
      repository: testRepo,
    });
  });

  it('detects duplicate delta storage target API errors', () => {
    expect(
      isDuplicateDeltaTargetError(
        'Error 409: an OCI repository with deltaStorageTarget already exists in this organization',
      ),
    ).toBe(true);
    expect(isDuplicateDeltaTargetError('Error 409: some other reason')).toBe(false);
    expect(isDuplicateDeltaTargetError('Error 400: bad request')).toBe(false);
  });

  it('rejects read-only access mode with delta storage target', async () => {
    const values = getOciFormValues({
      accessMode: OciRepoSpec.accessMode.READ,
    });
    const schema = repositorySchema(t, undefined)(values);
    await expect(schema.validate(values)).rejects.toMatchObject({
      path: 'ociConfig.accessMode',
      message: 'To use this registry as a delta storage target, the repository must have read and write access',
    });
  });

  it('does not override access mode in getRepository for delta storage target', () => {
    const spec = getRepository(
      getOciFormValues({
        accessMode: OciRepoSpec.accessMode.READ,
      }),
    ).spec;

    expect(spec).toMatchObject({
      deltaStorageTarget: true,
      accessMode: OciRepoSpec.accessMode.READ,
    });
  });

  it('requires repository path when placement mode is repository', async () => {
    const values = getOciFormValues({
      deltaStorageTarget: false,
      placementMode: OciPlacementMode.Repository,
      repository: '',
    });
    const schema = repositorySchema(t, undefined)(values);
    await expect(schema.validate(values)).rejects.toThrow();
  });
});
