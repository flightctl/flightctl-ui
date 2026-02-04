import yaml from 'js-yaml';
import {
  AppType,
  ApplicationContent,
  ApplicationProviderSpec,
  ApplicationResourceLimits,
  ApplicationVolume,
  ApplicationVolumeReclaimPolicy,
  ComposeApplication,
  ConfigProviderSpec,
  ContainerApplication,
  DeviceSpec,
  EncodingType,
  FileSpec,
  GitConfigProviderSpec,
  HelmApplication,
  HttpConfigProviderSpec,
  ImageApplicationProviderSpec,
  ImageMountVolumeProviderSpec,
  ImagePullPolicy,
  InlineApplicationProviderSpec,
  InlineConfigProviderSpec,
  KubernetesSecretProviderSpec,
  PatchRequest,
  QuadletApplication,
} from '@flightctl/types';
import {
  AppForm,
  AppSpecType,
  ApplicationVolumeForm,
  ComposeAppForm,
  ConfigSourceProvider,
  ConfigType,
  GitConfigTemplate,
  HelmAppForm,
  HttpConfigTemplate,
  InlineConfigTemplate,
  InlineFileForm,
  KubeSecretTemplate,
  QuadletAppForm,
  RUN_AS_FLIGHTCTL_USER,
  RUN_AS_ROOT_USER,
  SingleContainerAppForm,
  SpecConfigTemplate,
  SystemdUnitFormValue,
  isGitConfigTemplate,
  isGitProviderSpec,
  isHttpConfigTemplate,
  isHttpProviderSpec,
  isImageVariantApp,
  isInlineProviderSpec,
  isInlineVariantApp,
  isKubeProviderSpec,
  isKubeSecretTemplate,
} from '../../../types/deviceSpec';

const DEFAULT_INLINE_FILE_MODE = 420; // In Octal: 0644
const DEFAULT_INLINE_FILE_USER = 'root';
const DEFAULT_INLINE_FILE_GROUP = 'root';

export const ACM_REPO_NAME = 'acm-registration';
const ACM_CRD_YAML_PATH = '/var/local/acm-import/crd.yaml';
const ACM_IMPORT_YAML_PATH = '/var/local/acm-import/import.yaml';
const ACM_REPO_SUFFIX = `/agent-registration/manifests/`;

const MICROSHIFT_REGISTRATION_HOOK_NAME = 'apply-acm-manifests';
const MICROSHIFT_REGISTRATION_HOOK_FILE = '/etc/flightctl/hooks.d/afterupdating/50-acm-registration.yaml';
const MICROSHIFT_REGISTRATION_HOOK = `- run: /usr/bin/bash -c "until [ -f $KUBECONFIG ]; do sleep 1; done"
  timeout: 5m
  envVars:
    KUBECONFIG: /var/lib/microshift/resources/kubeadmin/kubeconfig
- run: kubectl wait --for=condition=Ready pods --all --all-namespaces --timeout=300s
  timeout: 5m
  envVars:
    KUBECONFIG: /var/lib/microshift/resources/kubeadmin/kubeconfig
- if:
  - path: /var/local/acm-import/crd.yaml
    op: [created]
  run: kubectl apply -f /var/local/acm-import/crd.yaml
  envVars:
    KUBECONFIG: /var/lib/microshift/resources/kubeadmin/kubeconfig
- if:
  - path: /var/local/acm-import/import.yaml
    op: [created]
  run: kubectl apply -f /var/local/acm-import/import.yaml
  envVars:
    KUBECONFIG: /var/lib/microshift/resources/kubeadmin/kubeconfig
`;

export const getConfigType = (config: ConfigSourceProvider): ConfigType | undefined => {
  if (isGitProviderSpec(config)) {
    return ConfigType.GIT;
  } else if (isInlineProviderSpec(config)) {
    return ConfigType.INLINE;
  } else if (isHttpProviderSpec(config)) {
    return ConfigType.HTTP;
  } else if (isKubeProviderSpec(config)) {
    return ConfigType.K8S_SECRET;
  }
  // Fallback in case a new configType is added to the Backend which the UI doesn't support yet
  return undefined;
};

const isSameGitConf = (a: GitConfigProviderSpec, b: GitConfigProviderSpec) => {
  const aRef = a.gitRef;
  const bRef = b.gitRef;
  return (
    a.name === b.name &&
    aRef.path === bRef.path &&
    aRef.repository === bRef.repository &&
    aRef.targetRevision === bRef.targetRevision
  );
};

const isSameHttpConf = (a: HttpConfigProviderSpec, b: HttpConfigProviderSpec) => {
  const aRef = a.httpRef;
  const bRef = b.httpRef;
  return (
    a.name === b.name &&
    aRef.filePath === bRef.filePath &&
    aRef.repository === bRef.repository &&
    (aRef.suffix || '') === (bRef.suffix || '')
  );
};

const isSameSecretConf = (a: KubernetesSecretProviderSpec, b: KubernetesSecretProviderSpec) => {
  const aRef = a.secretRef;
  const bRef = b.secretRef;
  return (
    a.name === b.name &&
    aRef.name === bRef.name &&
    aRef.namespace === bRef.namespace &&
    aRef.mountPath === bRef.mountPath
  );
};

const isSameInlineConfigValue = <T extends string | number>(a: T | undefined, b: T | undefined, defaultValue: T) => {
  const aValue = a === undefined ? defaultValue : a;
  const bValue = b === undefined ? defaultValue : b;
  return aValue === bValue;
};

const isSameInlineConf = (a: InlineConfigProviderSpec, b: InlineConfigProviderSpec) => {
  return (
    a.name === b.name &&
    a.inline.length === b.inline.length &&
    a.inline.every((aInline, index) => {
      const bInline = b.inline[index];
      return (
        aInline.path === bInline.path &&
        isSameInlineConfigValue<string>(aInline.user, bInline.user, DEFAULT_INLINE_FILE_USER) &&
        isSameInlineConfigValue<string>(aInline.group, bInline.group, DEFAULT_INLINE_FILE_GROUP) &&
        isSameInlineConfigValue<number>(aInline.mode, bInline.mode, DEFAULT_INLINE_FILE_MODE) &&
        isSameInlineConfigValue<string>(aInline.contentEncoding, bInline.contentEncoding, EncodingType.EncodingPlain) &&
        aInline.content === bInline.content
      );
    })
  );
};

export const getDeviceSpecConfigPatches = (
  currentConfigs: ConfigSourceProvider[],
  newConfigs: ConfigSourceProvider[],
  configPath: string,
) => {
  const allPatches: PatchRequest = [];

  if (currentConfigs.length === 0 && newConfigs.length > 0) {
    allPatches.push({
      path: configPath,
      op: 'add',
      value: newConfigs,
    });
  } else if (currentConfigs.length > 0 && newConfigs.length === 0) {
    allPatches.push({
      path: configPath,
      op: 'remove',
    });
  } else if (currentConfigs.length !== newConfigs.length) {
    allPatches.push({
      path: configPath,
      op: 'replace',
      value: newConfigs,
    });
  } else {
    const hasConfigChanges = newConfigs.some((newConfig) => {
      // Attempts to find a new config which has been changed from "currentConfigs"
      const isUnchanged = currentConfigs.some((conf) => {
        const currentType = getConfigType(conf);
        const newType = getConfigType(newConfig);
        if (currentType !== newType) {
          return false;
        }
        switch (newType) {
          case ConfigType.GIT:
            return isSameGitConf(newConfig as GitConfigProviderSpec, conf as GitConfigProviderSpec);
          case ConfigType.HTTP:
            return isSameHttpConf(newConfig as HttpConfigProviderSpec, conf as HttpConfigProviderSpec);
          case ConfigType.K8S_SECRET:
            return isSameSecretConf(newConfig as KubernetesSecretProviderSpec, conf as KubernetesSecretProviderSpec);
          case ConfigType.INLINE:
            return isSameInlineConf(newConfig as InlineConfigProviderSpec, conf as InlineConfigProviderSpec);
        }
        return false;
      });

      return !isUnchanged;
    });

    if (hasConfigChanges) {
      allPatches.push({
        path: configPath,
        op: 'replace',
        value: newConfigs,
      });
    }
  }

  return allPatches;
};

const haveInlineFilesChanged = (current: ApplicationContent[], updated: ApplicationContent[]): boolean => {
  if (current.length !== updated.length) return true;
  return current.some((file, index) => {
    const other = updated[index];
    const aBase64 = file.contentEncoding === EncodingType.EncodingBase64;
    const bBase64 = other.contentEncoding === EncodingType.EncodingBase64;
    return (
      aBase64 !== bBase64 || (file.path || '') !== (other.path || '') || (file.content || '') !== (other.content || '')
    );
  });
};

const haveEnvVarsChanged = (current: Record<string, string>, updated: Record<string, string>): boolean => {
  const aKeys = Object.keys(current);
  const bKeys = Object.keys(updated);
  if (aKeys.length !== bKeys.length) return true;
  return aKeys.some((key) => current[key] !== updated[key]);
};

const haveVolumesChanged = (current: ApplicationVolume[], updated: ApplicationVolume[]): boolean => {
  if (current.length !== updated.length) return true;
  return current.some((currentVol, index) => {
    const updatedVol = updated[index];
    if (currentVol.name !== updatedVol.name) return true;
    if (
      (currentVol.reclaimPolicy || ApplicationVolumeReclaimPolicy.RETAIN) !==
      (updatedVol.reclaimPolicy || ApplicationVolumeReclaimPolicy.RETAIN)
    )
      return true;

    const currentFull = currentVol as ApplicationVolume & ImageMountVolumeProviderSpec;
    const updatedFull = updatedVol as ApplicationVolume & ImageMountVolumeProviderSpec;
    const currentImageRef = currentFull.image?.reference || '';
    const updatedImageRef = updatedFull.image?.reference || '';
    if (currentImageRef !== updatedImageRef) return true;
    if (currentImageRef || updatedImageRef) {
      if (
        (currentFull.image?.pullPolicy || ImagePullPolicy.PullIfNotPresent) !==
        (updatedFull.image?.pullPolicy || ImagePullPolicy.PullIfNotPresent)
      )
        return true;
    }
    return (currentFull.mount?.path || '') !== (updatedFull.mount?.path || '');
  });
};

const hasStringChanged = (
  current: string | undefined,
  updated: string | undefined,
  defaultValue: string = '',
): boolean => (current || defaultValue) !== (updated || defaultValue);

const havePortsChanged = (current: string[], updated: string[]): boolean => {
  if (current.length !== updated.length) return true;
  return current.some((port, index) => port !== updated[index]);
};

const haveResourceLimitsChanged = (
  current: { cpu?: string; memory?: string } | undefined,
  updated: { cpu?: string; memory?: string } | undefined,
): boolean => {
  return (current?.cpu || '') !== (updated?.cpu || '') || (current?.memory || '') !== (updated?.memory || '');
};

const haveValuesFilesChanged = (current: string[], updated: string[]): boolean => {
  const a = current.filter((f) => f.trim() !== '');
  const b = updated.filter((f) => f.trim() !== '');
  if (a.length !== b.length) return true;
  return a.some((file, i) => file !== b[i]);
};

const haveHelmValuesChanged = (current: Record<string, unknown>, updated: Record<string, unknown>): boolean =>
  JSON.stringify(current) !== JSON.stringify(updated);

const hasRunAsChanged = (current: string | undefined, updated: string | undefined): boolean => {
  if (!current) {
    // For empty "runAs", we mark the app as changed.
    // This means that we'll set the field explicitly to the default user (currently "root").
    return true;
  }
  return current !== updated;
};

// Single container apps always have an image, and it doesn't have an inline variant
const hasContainerAppChanged = (current: ContainerApplication, updated: ContainerApplication): boolean =>
  hasStringChanged(current.name, updated.name) ||
  hasStringChanged(current.image, updated.image) ||
  havePortsChanged(current.ports || [], updated.ports || []) ||
  haveResourceLimitsChanged(current.resources?.limits, updated.resources?.limits) ||
  haveEnvVarsChanged(current.envVars || {}, updated.envVars || {}) ||
  hasRunAsChanged(current.runAs, updated.runAs) ||
  haveVolumesChanged(current.volumes || [], updated.volumes || []);

// Helm apps always have an image (chart), and it doesn't have an inline variant
const hasHelmAppChanged = (current: HelmApplication, updated: HelmApplication): boolean =>
  hasStringChanged(current.name, updated.name) ||
  hasStringChanged(current.image, updated.image) ||
  hasStringChanged(current.namespace, updated.namespace) ||
  haveValuesFilesChanged(current.valuesFiles || [], updated.valuesFiles || []) ||
  haveHelmValuesChanged(current.values || {}, updated.values || {});

const hasComposeAppChanged = (
  current: ComposeApplication,
  updated: ComposeApplication,
  specType: AppSpecType,
): boolean => {
  const baseChanged =
    hasStringChanged(current.name, updated.name) ||
    haveEnvVarsChanged(current.envVars || {}, updated.envVars || {}) ||
    haveVolumesChanged(current.volumes || [], updated.volumes || []);

  if (baseChanged) {
    return true;
  }

  if (specType === AppSpecType.OCI_IMAGE) {
    return hasStringChanged(
      (current as ImageApplicationProviderSpec).image,
      (updated as ImageApplicationProviderSpec).image,
    );
  }
  return haveInlineFilesChanged(
    (current as InlineApplicationProviderSpec).inline,
    (updated as InlineApplicationProviderSpec).inline,
  );
};

// Quadlet apps are currently the same as Compose apps, plus an optional "runAs" field.
const hasQuadletAppChanged = (
  current: QuadletApplication,
  updated: QuadletApplication,
  specType: AppSpecType,
): boolean => {
  const baseChanged = hasComposeAppChanged(current, updated, specType);
  if (baseChanged) {
    return true;
  }
  return hasRunAsChanged(current.runAs, updated.runAs);
};

const hasApplicationChanged = (current: ApplicationProviderSpec, updated: ApplicationProviderSpec): boolean => {
  if (current.appType !== updated.appType) {
    return true;
  }

  const currentSpectType = isImageVariantApp(current) ? AppSpecType.OCI_IMAGE : AppSpecType.INLINE;
  const updatedSpectType = isImageVariantApp(updated) ? AppSpecType.OCI_IMAGE : AppSpecType.INLINE;
  if (currentSpectType !== updatedSpectType) {
    return true;
  }
  switch (current.appType) {
    case AppType.AppTypeContainer:
      return hasContainerAppChanged(current as ContainerApplication, updated as ContainerApplication);
    case AppType.AppTypeHelm:
      return hasHelmAppChanged(current as HelmApplication, updated as HelmApplication);
    case AppType.AppTypeQuadlet:
      return hasQuadletAppChanged(current as QuadletApplication, updated as QuadletApplication, currentSpectType);
    case AppType.AppTypeCompose:
      return hasComposeAppChanged(current as ComposeApplication, updated as ComposeApplication, currentSpectType);
  }
};

const variablesToEnvVars = (variables: { name: string; value: string }[]) => {
  if (variables.length === 0) {
    return undefined;
  }
  return variables.reduce(
    (acc, v) => {
      if (v.name) {
        acc[v.name] = v.value || '';
      }
      return acc;
    },
    {} as Record<string, string>,
  );
};

/**
 * Converts form volumes to API volumes, ignoring fields that are not allowed for the given app type.
 * Quadlet/Compose apps --> can only be image volumes (mount is not allowed)
 * Container apps --> can either be mount or image mount volumes
 */
const formVolumesToApi = (volumes: ApplicationVolumeForm[], appType: AppType): ApplicationVolume[] => {
  return volumes.map((v) => {
    const vol: Partial<ApplicationVolume & ImageMountVolumeProviderSpec> = {
      name: v.name || '',
    };
    if (v.imageRef) {
      vol.image = {
        reference: v.imageRef,
        pullPolicy: v.imagePullPolicy || ImagePullPolicy.PullIfNotPresent,
      };
    }
    if (v.mountPath && appType === AppType.AppTypeContainer) {
      vol.mount = { path: v.mountPath };
    }
    return vol as ApplicationVolume;
  });
};

const formFilesToApi = (files: InlineFileForm[]) =>
  files.map((f) => ({
    path: f.path,
    content: f.content || '',
    contentEncoding: f.base64 ? EncodingType.EncodingBase64 : EncodingType.EncodingPlain,
  }));

const toFormFiles = (files: ApplicationContent[]) =>
  files.map((file) => ({
    path: file.path || '',
    content: file.content || '',
    base64: file.contentEncoding === EncodingType.EncodingBase64,
  }));

const toApiHelmApp = (app: HelmAppForm): HelmApplication => {
  const helmApp: HelmApplication = {
    name: app.name,
    image: app.image,
    appType: app.appType,
  };
  if (app.namespace) {
    helmApp.namespace = app.namespace;
  }
  if (app.valuesYaml) {
    try {
      const values = yaml.load(app.valuesYaml) as Record<string, unknown>;
      if (values && Object.keys(values).length > 0) helmApp.values = values;
    } catch {
      // leave values unset on invalid YAML
    }
  }
  const fileNames = (app.valuesFiles || []).filter((f) => f.trim() !== '');
  if (fileNames.length > 0) {
    helmApp.valuesFiles = fileNames;
  }
  return helmApp;
};

const toApiContainerApp = (app: SingleContainerAppForm): ContainerApplication => {
  const containerApp: ContainerApplication = {
    name: app.name,
    image: app.image,
    appType: app.appType,
    runAs: app.runAs || RUN_AS_ROOT_USER,
    envVars: variablesToEnvVars(app.variables || []),
    volumes: formVolumesToApi(app.volumes || [], AppType.AppTypeContainer),
  };
  if (app.ports.length > 0) {
    containerApp.ports = app.ports.map((p) => `${p.hostPort}:${p.containerPort}`);
  }

  const cpu = app.cpuLimit;
  const memory = app.memoryLimit;
  if (cpu || memory) {
    const limits: ApplicationResourceLimits = {};
    if (cpu) {
      limits.cpu = cpu;
    }
    if (memory) {
      limits.memory = memory;
    }

    containerApp.resources = { limits };
  }
  return containerApp;
};

const toApiComposeApp = (app: ComposeAppForm): ComposeApplication => {
  const formApp: Partial<ComposeApplication> = {
    name: app.name,
    appType: app.appType,
    envVars: variablesToEnvVars(app.variables || []),
    volumes: formVolumesToApi(app.volumes || [], app.appType),
  };
  if (app.specType === AppSpecType.OCI_IMAGE) {
    (formApp as ImageApplicationProviderSpec).image = app.image;
  } else {
    (formApp as InlineApplicationProviderSpec).inline = formFilesToApi(app.files);
  }
  return formApp as ComposeApplication;
};

// Quadlet apps are currently the same as Compose apps, plus an optional "runAs" field.
const toApiQuadletApp = (app: QuadletAppForm): QuadletApplication => {
  const baseApp = toApiComposeApp(app);
  return { ...baseApp, appType: AppType.AppTypeQuadlet, runAs: app.runAs || RUN_AS_ROOT_USER };
};

export const toApiApplication = (app: AppForm): ApplicationProviderSpec => {
  switch (app.appType) {
    case AppType.AppTypeHelm:
      return toApiHelmApp(app as HelmAppForm);
    case AppType.AppTypeContainer:
      return toApiContainerApp(app as SingleContainerAppForm);
    case AppType.AppTypeQuadlet:
      return toApiQuadletApp(app as QuadletAppForm);
    case AppType.AppTypeCompose:
      return toApiComposeApp(app as ComposeAppForm);
    default:
      throw new Error('Unknown application type');
  }
};

const toFormVariables = (envVars: Record<string, string>): { name: string; value: string }[] =>
  Object.entries(envVars).map(([name, value]) => ({ name, value: value || '' }));

const toFormVolumes = (volumes?: ApplicationVolume[]): ApplicationVolumeForm[] => {
  if (!volumes) return [];
  return volumes.map((vol) => {
    const fullVolume = vol as ApplicationVolume & ImageMountVolumeProviderSpec;
    return {
      name: fullVolume.name,
      imageRef: fullVolume.image?.reference || '',
      mountPath: fullVolume.mount?.path || '',
      imagePullPolicy: fullVolume.image?.pullPolicy || ImagePullPolicy.PullIfNotPresent,
    };
  });
};

const toFormApps = (app: ApplicationProviderSpec): AppForm => {
  switch (app.appType) {
    case AppType.AppTypeContainer:
      return toContainerAppForm(app as ContainerApplication);
    case AppType.AppTypeHelm:
      return toHelmAppForm(app as HelmApplication);
    case AppType.AppTypeQuadlet:
      return toQuadletAppForm(app as QuadletApplication);
    case AppType.AppTypeCompose:
      return toComposeAppForm(app as ComposeApplication);
    default:
      throw new Error('Unknown application type');
  }
};

export const getApplicationPatches = (
  basePath: string,
  currentApps: ApplicationProviderSpec[],
  updatedApps: AppForm[],
): PatchRequest => {
  const patches: PatchRequest = [];
  const currentLen = currentApps.length;
  const newLen = updatedApps.length;

  if (currentLen === 0 && newLen > 0) {
    patches.push({ path: `${basePath}/applications`, op: 'add', value: updatedApps.map(toApiApplication) });
  } else if (currentLen > 0 && newLen === 0) {
    patches.push({ path: `${basePath}/applications`, op: 'remove' });
  } else if (currentLen !== newLen) {
    patches.push({ path: `${basePath}/applications`, op: 'replace', value: updatedApps.map(toApiApplication) });
  } else {
    currentApps.forEach((currentApp, index) => {
      const updatedApp = updatedApps[index];
      const updatedApi = toApiApplication(updatedApp);
      if (hasApplicationChanged(currentApp, updatedApi)) {
        patches.push({
          path: `${basePath}/applications/${index}`,
          op: 'replace',
          value: updatedApi,
        });
      }
    });
  }
  return patches;
};

export const getApiConfig = (ct: SpecConfigTemplate): ConfigSourceProvider => {
  if (isGitConfigTemplate(ct)) {
    return {
      name: ct.name,
      gitRef: {
        path: ct.path,
        repository: ct.repository,
        targetRevision: ct.targetRevision,
      },
    };
  }
  if (isKubeSecretTemplate(ct)) {
    return {
      name: ct.name,
      secretRef: {
        mountPath: ct.mountPath,
        name: ct.secretName,
        namespace: ct.secretNs,
      },
    };
  }
  if (isHttpConfigTemplate(ct)) {
    return {
      name: ct.name,
      httpRef: {
        repository: ct.repository,
        suffix: ct.suffix,
        filePath: ct.filePath,
      },
    };
  }
  return {
    name: ct.name,
    inline: ct.files.map((file) => {
      const baseProps: FileSpec = {
        path: file.path,
        content: file.content,
        mode: file.permissions ? parseInt(file.permissions, 8) : undefined,
        contentEncoding: file.base64 ? EncodingType.EncodingBase64 : undefined,
      };
      // user / group fields cannot be sent as empty in PATCH operations
      if (file.user) {
        baseProps.user = file.user;
      }
      if (file.group) {
        baseProps.group = file.group;
      }
      return baseProps;
    }),
  };
};

const getRunAsUser = (app: ContainerApplication | QuadletApplication | undefined): string => {
  if (app) {
    // Existing apps that don't have a "runAs" user are actually running as the "root" user.
    return app.runAs || RUN_AS_ROOT_USER;
  }
  // For new applications, we want to promote "flightctl" as the default user.
  return RUN_AS_FLIGHTCTL_USER;
};

const toContainerAppForm = (containerApp: ContainerApplication | undefined): SingleContainerAppForm => {
  const ports =
    containerApp?.ports?.map((portString) => {
      const [hostPort, containerPort] = portString.split(':');
      return { hostPort: hostPort || '', containerPort: containerPort || '' };
    }) || [];

  const limits = containerApp?.resources?.limits;

  return {
    appType: AppType.AppTypeContainer,
    specType: AppSpecType.OCI_IMAGE,
    name: containerApp?.name || '',
    image: containerApp?.image || '',
    variables: toFormVariables(containerApp?.envVars || {}),
    volumes: toFormVolumes(containerApp?.volumes),
    ports,
    cpuLimit: limits?.cpu || '',
    memoryLimit: limits?.memory || '',
    runAs: getRunAsUser(containerApp),
  };
};

const toHelmAppForm = (helmApp: HelmApplication | undefined): HelmAppForm => {
  // We want to always show at least one values file field, even when no files have been added yet.
  const values = helmApp?.values || {};
  const valuesFiles = helmApp?.valuesFiles?.length ? helmApp.valuesFiles : [''];
  const valuesYaml = Object.keys(values || {}).length > 0 ? yaml.dump(values) : '';

  return {
    appType: AppType.AppTypeHelm,
    specType: AppSpecType.OCI_IMAGE,
    name: helmApp?.name || '',
    image: helmApp?.image || '',
    namespace: helmApp?.namespace || '',
    valuesYaml,
    valuesFiles,
  };
};

const toComposeAppForm = (app: ComposeApplication | undefined): ComposeAppForm => {
  const isInlineVariant = app && isInlineVariantApp(app);
  const specType = isInlineVariant ? AppSpecType.INLINE : AppSpecType.OCI_IMAGE;
  const formApp: Partial<QuadletAppForm | ComposeAppForm> = {
    appType: AppType.AppTypeCompose,
    specType,
    name: app?.name || '',
    variables: toFormVariables(app?.envVars || {}),
    volumes: toFormVolumes(app?.volumes),
  };

  // We want to have both fields initialized for the formik form
  if (isInlineVariant) {
    formApp.files = toFormFiles(app?.inline || []);
    formApp.image = '';
  } else {
    formApp.image = app?.image || '';
    formApp.files = [];
  }
  return formApp as ComposeAppForm;
};

const toQuadletAppForm = (app: QuadletApplication | undefined): QuadletAppForm => {
  const baseApp = toComposeAppForm(app);

  return {
    ...baseApp,
    appType: AppType.AppTypeQuadlet,
    runAs: getRunAsUser(app),
  };
};

export const createInitialAppForm = (appType: AppType, name: string = ''): AppForm => {
  let app: AppForm;
  switch (appType) {
    case AppType.AppTypeContainer:
      app = toContainerAppForm(undefined);
      break;
    case AppType.AppTypeHelm:
      app = toHelmAppForm(undefined);
      break;
    case AppType.AppTypeQuadlet:
      app = toQuadletAppForm(undefined);
      break;
    case AppType.AppTypeCompose:
      app = toComposeAppForm(undefined);
      break;
    default:
      throw new Error('Unknown application type');
  }
  app.name = name;
  return app;
};

export const getApplicationValues = (deviceSpec?: DeviceSpec): AppForm[] =>
  (deviceSpec?.applications || []).map(toFormApps);

export const getSystemdUnitsValues = (deviceSpec?: DeviceSpec): SystemdUnitFormValue[] => {
  return (
    deviceSpec?.systemd?.matchPatterns?.map((pattern) => ({
      pattern,
      exists: true,
    })) || []
  );
};

export const getConfigTemplatesValues = (deviceSpec?: DeviceSpec, registerMicroShift?: boolean) => {
  const deviceConfig = registerMicroShift
    ? deviceSpec?.config?.filter((c) => !isConfigACMCrd(c) && !isConfigACMImport(c) && !isMicroshiftRegistrationHook(c))
    : deviceSpec?.config;
  return (
    deviceConfig?.map<SpecConfigTemplate>((c) => {
      if (isGitProviderSpec(c)) {
        return {
          type: ConfigType.GIT,
          name: c.name,
          path: c.gitRef.path,
          repository: c.gitRef.repository,
          targetRevision: c.gitRef.targetRevision,
        } as GitConfigTemplate;
      }
      if (isKubeProviderSpec(c)) {
        return {
          type: ConfigType.K8S_SECRET,
          name: c.name,
          mountPath: c.secretRef.mountPath,
          secretName: c.secretRef.name,
          secretNs: c.secretRef.namespace,
        } as KubeSecretTemplate;
      }
      if (isHttpProviderSpec(c)) {
        return {
          type: ConfigType.HTTP,
          name: c.name,
          repository: c.httpRef.repository,
          suffix: c.httpRef.suffix,
          filePath: c.httpRef.filePath,
        } as HttpConfigTemplate;
      }

      return {
        type: ConfigType.INLINE,
        name: c.name,
        files: c.inline.map((inline) => {
          return {
            user: inline.user,
            group: inline.group,
            path: inline.path,
            permissions: inline.mode !== undefined ? formatFileMode(inline.mode) : undefined,
            content: inline.content,
            base64: inline.contentEncoding === EncodingType.EncodingBase64,
          } as InlineConfigTemplate['files'][0];
        }),
      } as InlineConfigTemplate;
    }) || []
  );
};

export const formatFileMode = (mode: string | number): string => {
  const modeStr = typeof mode === 'number' ? mode.toString(8) : mode;
  const prefixSize = 4 - modeStr.length;
  return prefixSize > 0 ? `${'0'.repeat(prefixSize)}${modeStr}` : modeStr;
};

export const ACMCrdConfig: HttpConfigProviderSpec = {
  name: 'acm-crd',
  httpRef: {
    filePath: ACM_CRD_YAML_PATH,
    repository: ACM_REPO_NAME,
    suffix: '/agent-registration/crds/v1',
  },
};

export const ACMImportConfig: HttpConfigProviderSpec = {
  name: 'acm-registration',
  httpRef: {
    filePath: ACM_IMPORT_YAML_PATH,
    repository: ACM_REPO_NAME,
    suffix: `${ACM_REPO_SUFFIX}{{ .metadata.name }}`,
  },
};

const isConfigACMCrd = (c: ConfigProviderSpec) => {
  if (!isHttpProviderSpec(c)) {
    return false;
  }
  return (
    c.name === ACMCrdConfig.name &&
    c.httpRef.filePath === ACMCrdConfig.httpRef.filePath &&
    c.httpRef.repository === ACMCrdConfig.httpRef.repository &&
    c.httpRef.suffix === ACMCrdConfig.httpRef.suffix
  );
};

const isConfigACMImport = (c: ConfigProviderSpec) => {
  if (!isHttpProviderSpec(c)) {
    return false;
  }
  return (
    c.name === ACMImportConfig.name &&
    c.httpRef.filePath === ACMImportConfig.httpRef.filePath &&
    c.httpRef.repository === ACMImportConfig.httpRef.repository &&
    c.httpRef.suffix?.startsWith(ACM_REPO_SUFFIX)
  );
};

const isMicroshiftRegistrationHook = (c: ConfigProviderSpec) => {
  if (!isInlineProviderSpec(c)) {
    return false;
  }
  return (
    c.name === MICROSHIFT_REGISTRATION_HOOK_NAME &&
    c.inline.length === 1 &&
    c.inline[0].path === MICROSHIFT_REGISTRATION_HOOK_FILE &&
    c.inline[0].content === MICROSHIFT_REGISTRATION_HOOK
  );
};

export const MicroshiftRegistrationHook: InlineConfigProviderSpec = {
  name: MICROSHIFT_REGISTRATION_HOOK_NAME,
  inline: [
    {
      path: MICROSHIFT_REGISTRATION_HOOK_FILE,
      content: MICROSHIFT_REGISTRATION_HOOK,
    },
  ],
};

export const hasMicroshiftRegistrationConfig = (deviceSpec?: DeviceSpec): boolean => {
  if (!deviceSpec) {
    return false;
  }
  const hasCrdsSpec = deviceSpec.config?.some(isConfigACMCrd);
  const hasImportSpec = deviceSpec.config?.some(isConfigACMImport);
  const hasRegistrationHook = deviceSpec.config?.some(isMicroshiftRegistrationHook);

  return !!hasCrdsSpec && !!hasImportSpec && !!hasRegistrationHook;
};
