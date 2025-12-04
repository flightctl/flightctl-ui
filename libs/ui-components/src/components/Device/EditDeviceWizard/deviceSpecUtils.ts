import {
  AppType,
  // eslint-disable-next-line no-restricted-imports
  ApplicationProviderSpec,
  ApplicationResourceLimits,
  ApplicationVolume,
  ConfigProviderSpec,
  DeviceSpec,
  EncodingType,
  FileSpec,
  GitConfigProviderSpec,
  HttpConfigProviderSpec,
  ImageApplicationProviderSpec,
  ImageMountVolumeProviderSpec,
  ImagePullPolicy,
  InlineApplicationProviderSpec,
  InlineConfigProviderSpec,
  KubernetesSecretProviderSpec,
  PatchRequest,
} from '@flightctl/types';
import {
  AppForm,
  AppSpecType,
  ApplicationVolumeForm,
  ComposeImageAppForm,
  ComposeInlineAppForm,
  ConfigSourceProvider,
  ConfigType,
  GitConfigTemplate,
  HttpConfigTemplate,
  InlineConfigTemplate,
  KubeSecretTemplate,
  PortMapping,
  QuadletImageAppForm,
  QuadletInlineAppForm,
  SpecConfigTemplate,
  SystemdUnitFormValue,
  isComposeImageAppForm,
  isGitConfigTemplate,
  isGitProviderSpec,
  isHttpConfigTemplate,
  isHttpProviderSpec,
  isImageAppProvider,
  isInlineProviderSpec,
  isKubeProviderSpec,
  isKubeSecretTemplate,
  isQuadletImageAppForm,
  isSingleContainerAppForm,
} from '../../../types/deviceSpec';
import { ApplicationProviderSpecFixed, InlineApplicationFileFixed } from '../../../types/extraTypes';

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

export const toAPIApplication = (app: AppForm): ApplicationProviderSpec => {
  const envVars = app.variables.reduce((acc, variable) => {
    acc[variable.name] = variable.value;
    return acc;
  }, {});

  const volumes = app.volumes?.map((v) => {
    const volume: Partial<ApplicationVolume & ImageMountVolumeProviderSpec> = {
      name: v.name || '',
    };

    if (v.imageRef) {
      volume.image = {
        reference: v.imageRef,
        pullPolicy: v.imagePullPolicy || ImagePullPolicy.PullIfNotPresent,
      };
    }
    if (v.mountPath) {
      volume.mount = {
        path: v.mountPath,
      };
    }
    return volume as ApplicationVolume;
  });

  if (isSingleContainerAppForm(app)) {
    const data: ImageApplicationProviderSpec & ApplicationProviderSpec = {
      image: app.image,
      appType: app.appType,
      envVars,
      volumes,
    };
    if (app.name) {
      data.name = app.name;
    }
    if (app.ports) {
      data.ports = app.ports.map((p) => `${p.hostPort}:${p.containerPort}`);
    }
    // Removed fields must not appear in the resources object
    const appLimits: ApplicationResourceLimits = {};
    if (app.limits?.cpu) {
      appLimits.cpu = app.limits.cpu;
    }
    if (app.limits?.memory) {
      appLimits.memory = app.limits.memory;
    }
    if (Object.keys(appLimits).length > 0) {
      data.resources = {
        limits: appLimits,
      };
    }
    return data as ApplicationProviderSpec;
  }

  if (isQuadletImageAppForm(app) || isComposeImageAppForm(app)) {
    const data: ApplicationProviderSpec = {
      image: app.image,
      appType: app.appType,
      envVars,
      volumes,
    };
    if (app.name) {
      data.name = app.name;
    }
    return data;
  }

  // Inline applications (Quadlet or Compose)
  return {
    name: app.name,
    appType: app.appType,
    inline: app.files.map(
      (file): InlineApplicationFileFixed => ({
        path: file.path,
        content: file.content || '',
        contentEncoding: file.base64 ? EncodingType.EncodingBase64 : EncodingType.EncodingPlain,
      }),
    ),
    envVars,
    volumes,
  };
};

const hasInlineApplicationChanged = (
  currentApp: InlineApplicationProviderSpec,
  updatedApp: QuadletInlineAppForm | ComposeInlineAppForm,
) => {
  if (currentApp.inline.length !== updatedApp.files.length) {
    return true;
  }
  const filesChanged = currentApp.inline.some((file, index) => {
    const updatedFile = updatedApp.files[index];
    const isCurrentBase64 = file.contentEncoding === EncodingType.EncodingBase64;
    return (
      (updatedFile.base64 || false) !== isCurrentBase64 ||
      updatedFile.path !== file.path ||
      updatedFile.content !== file.content
    );
  });
  if (filesChanged) {
    return true;
  }
  return !areVolumesEqual(currentApp.volumes || [], updatedApp.volumes || []);
};

const areVolumesEqual = (currentVolumes: ApplicationVolume[], updatedFormVolumes: ApplicationVolumeForm[]): boolean => {
  if (currentVolumes.length !== updatedFormVolumes.length) {
    return false;
  }

  return currentVolumes.every((currentVol, index) => {
    const updatedFormVol = updatedFormVolumes[index];
    const currentFullVol = currentVol as ApplicationVolume & ImageMountVolumeProviderSpec;

    if (currentFullVol.name !== updatedFormVol.name) {
      return false;
    }

    const currentImageRef = currentFullVol.image?.reference || '';
    const updatedImageRef = updatedFormVol?.imageRef || '';
    if (currentImageRef !== updatedImageRef) {
      return false;
    }

    if (currentImageRef || updatedImageRef) {
      const currentPullPolicy = currentFullVol.image?.pullPolicy || ImagePullPolicy.PullIfNotPresent;
      const updatedPullPolicy = updatedFormVol?.imagePullPolicy || ImagePullPolicy.PullIfNotPresent;
      if (currentPullPolicy !== updatedPullPolicy) {
        return false;
      }
    }

    const currentMountPath = currentFullVol.mount?.path || '';
    const updatedMountPath = updatedFormVol?.mountPath || '';
    if (currentMountPath !== updatedMountPath) {
      return false;
    }

    return true;
  });
};

const arePortsEqual = (currentPorts: string[], updatedPorts: PortMapping[]): boolean => {
  if (currentPorts.length !== updatedPorts.length) {
    return false;
  }

  // Reordered ports will be considered as changed
  return currentPorts.every((currentPort, index) => {
    const updatedPort = updatedPorts[index];
    return currentPort === `${updatedPort.hostPort}:${updatedPort.containerPort}`;
  });
};

const areResourceLimitsEqual = (
  currentLimits: { cpu?: string; memory?: string } | undefined,
  updatedLimits: { cpu?: string; memory?: string } | undefined,
): boolean => {
  const currentCpu = currentLimits?.cpu || '';
  const updatedCpu = updatedLimits?.cpu || '';
  const currentMemory = currentLimits?.memory || '';
  const updatedMemory = updatedLimits?.memory || '';

  return currentCpu === updatedCpu && currentMemory === updatedMemory;
};

const areEnvVariablesEqual = (
  currentVars: Record<string, string> | undefined,
  updatedFormVars: { name: string; value: string }[],
): boolean => {
  const envVars = currentVars || {};
  if (Object.keys(envVars).length !== updatedFormVars.length) {
    return false;
  }

  return updatedFormVars.every((variable) => {
    // Envvars may have "falsy" values (eg. number 0) when they are defined
    return variable.name in envVars && envVars[variable.name] === variable.value;
  });
};

const hasSingleContainerAppChanged = (currentApp: ApplicationProviderSpec, updatedApp: AppForm): boolean => {
  if (!isSingleContainerAppForm(updatedApp)) {
    return true;
  }

  const imageApp = currentApp as ImageApplicationProviderSpec & ApplicationProviderSpec;
  if (imageApp.name !== updatedApp.name || imageApp.image !== updatedApp.image) {
    return true;
  }

  if (!arePortsEqual(imageApp.ports || [], updatedApp.ports || [])) {
    return true;
  }

  if (!areResourceLimitsEqual(imageApp.resources?.limits, updatedApp.limits)) {
    return true;
  }

  if (!areEnvVariablesEqual(imageApp.envVars, updatedApp.variables)) {
    return true;
  }

  return !areVolumesEqual(imageApp.volumes || [], updatedApp.volumes || []);
};

const hasApplicationChanged = (currentApp: ApplicationProviderSpec, updatedApp: AppForm): boolean => {
  const isCurrentImageApp = isImageAppProvider(currentApp);
  const currentAppSpecType = isCurrentImageApp ? AppSpecType.OCI_IMAGE : AppSpecType.INLINE;

  // Check if application name changed, or it's a different type of application (either specType or appType)
  if (
    currentAppSpecType !== updatedApp.specType ||
    currentApp.appType !== updatedApp.appType ||
    currentApp.name !== updatedApp.name
  ) {
    return true;
  }

  if (!areEnvVariablesEqual(currentApp.envVars, updatedApp.variables)) {
    return true;
  }

  // The app is a single container application
  if (isSingleContainerAppForm(updatedApp)) {
    return hasSingleContainerAppChanged(currentApp, updatedApp);
  }

  // The app is an image application (Quadlet/Compose image apps)
  if (isCurrentImageApp) {
    const imageApp = currentApp as ImageApplicationProviderSpec;
    const updatedImageApp = updatedApp as QuadletImageAppForm | ComposeImageAppForm;
    if (imageApp.image !== updatedImageApp.image) {
      return true;
    }

    return !areVolumesEqual(imageApp.volumes || [], updatedApp.volumes || []);
  }

  // The app must be an inline application
  return hasInlineApplicationChanged(
    currentApp as InlineApplicationProviderSpec,
    updatedApp as QuadletInlineAppForm | ComposeInlineAppForm,
  );
};

export const getApplicationPatches = (
  basePath: string,
  currentApps: ApplicationProviderSpec[],
  updatedApps: AppForm[],
) => {
  const patches: PatchRequest = [];

  const currentLen = currentApps.length;
  const newLen = updatedApps.length;

  if (currentLen === 0 && newLen > 0) {
    // First apps(s) have been added
    patches.push({
      path: `${basePath}/applications`,
      op: 'add',
      value: updatedApps.map(toAPIApplication),
    });
  } else if (currentLen > 0 && newLen === 0) {
    // Last app(s) have been removed
    patches.push({
      path: `${basePath}/applications`,
      op: 'remove',
    });
  } else if (currentLen !== newLen) {
    // Array length changed, need to replace entire array
    patches.push({
      path: `${basePath}/applications`,
      op: 'replace',
      value: updatedApps.map(toAPIApplication),
    });
  } else {
    // Apps length has not changed. We only PATCH the applications that have actually changed
    currentApps.forEach((currentApp, index) => {
      const updatedApp = updatedApps[index];
      if (hasApplicationChanged(currentApp, updatedApp)) {
        patches.push({
          path: `${basePath}/applications/${index}`,
          op: 'replace',
          value: toAPIApplication(updatedApp),
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

const getAppFormVariables = (app: ApplicationProviderSpecFixed) =>
  Object.entries(app.envVars || {}).map(([varName, varValue]) => ({ name: varName, value: varValue }));

const convertVolumesToForm = (volumes?: ApplicationVolume[]) => {
  if (!volumes) return [];
  return volumes.map((vol) => {
    const fullVolume = vol as ApplicationVolume & ImageMountVolumeProviderSpec;
    const volForm: ApplicationVolumeForm = {
      name: fullVolume.name,
      imageRef: fullVolume.image?.reference || '',
      mountPath: fullVolume.mount?.path || '',
    };
    // Only set imagePullPolicy if there's an image
    if (fullVolume.image) {
      volForm.imagePullPolicy = fullVolume.image.pullPolicy || ImagePullPolicy.PullIfNotPresent;
    }
    return volForm;
  });
};

export const getApplicationValues = (deviceSpec?: DeviceSpec): AppForm[] => {
  const apps = deviceSpec?.applications || [];
  return apps.map((app) => {
    if (!app.appType) {
      throw new Error('Application appType is required');
    }
    // Single container application
    if (app.appType === AppType.AppTypeContainer && isImageAppProvider(app)) {
      const imageApp = app as ImageApplicationProviderSpec;
      const ports =
        imageApp.ports?.map((portString) => {
          const [hostPort, containerPort] = portString.split(':');
          return { hostPort: hostPort || '', containerPort: containerPort || '' };
        }) || [];

      return {
        specType: AppSpecType.OCI_IMAGE,
        appType: AppType.AppTypeContainer,
        name: app.name || '',
        image: app.image,
        variables: getAppFormVariables(app),
        volumes: convertVolumesToForm(app.volumes),
        ports,
        limits: imageApp.resources?.limits
          ? {
              cpu: imageApp.resources.limits.cpu || '',
              memory: imageApp.resources.limits.memory || '',
            }
          : undefined,
      };
    }

    // Compose or Quadlet image application
    if (isImageAppProvider(app)) {
      return {
        specType: AppSpecType.OCI_IMAGE,
        name: app.name || '',
        image: app.image,
        appType: app.appType,
        variables: getAppFormVariables(app),
        volumes: convertVolumesToForm(app.volumes),
      };
    }

    // Compose or Quadlet inline application
    const inlineApp = app as InlineApplicationProviderSpec;
    return {
      specType: AppSpecType.INLINE,
      appType: app.appType,
      name: app.name || '',
      files: inlineApp.inline,
      variables: getAppFormVariables(app),
      volumes: convertVolumesToForm(app.volumes),
    } as QuadletInlineAppForm | ComposeInlineAppForm;
  });
};

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
