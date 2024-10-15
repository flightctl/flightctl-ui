import {
  DeviceSpec,
  FileSpec,
  GitConfigProviderSpec,
  HttpConfigProviderSpec,
  InlineConfigProviderSpec,
  KubernetesSecretProviderSpec,
  PatchRequest,
} from '@flightctl/types';
import {
  ConfigSourceProvider,
  GitConfigTemplate,
  HttpConfigTemplate,
  InlineConfigTemplate,
  KubeSecretTemplate,
  SpecConfigTemplate,
  isGitConfigTemplate,
  isGitProviderSpec,
  isHttpConfigTemplate,
  isHttpProviderSpec,
  isKubeProviderSpec,
  isKubeSecretTemplate,
} from '../../../types/deviceSpec';

const isSameGitConf = (a: GitConfigProviderSpec, b: GitConfigProviderSpec) => {
  const aRef = a.gitRef;
  const bRef = b.gitRef;
  return (
    a.name === b.name &&
    aRef.path === bRef.path &&
    aRef.repository === bRef.repository &&
    aRef.targetRevision === bRef.targetRevision &&
    (aRef.mountPath || '') === (bRef.mountPath || '')
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

const isSameInlineConf = (a: InlineConfigProviderSpec, b: InlineConfigProviderSpec) => {
  return (
    a.name === b.name &&
    a.inline.length === b.inline.length &&
    a.inline.every((aInline, index) => {
      const bInline = b.inline[index];
      return (
        aInline.content === bInline.content &&
        (aInline.contentEncoding === bInline.contentEncoding ||
          (aInline.contentEncoding === undefined && bInline.contentEncoding === FileSpec.contentEncoding.PLAIN) ||
          (bInline.contentEncoding === undefined && aInline.contentEncoding === FileSpec.contentEncoding.PLAIN)) &&
        aInline.group === bInline.group &&
        aInline.user === bInline.user &&
        aInline.path === bInline.path &&
        aInline.mode === bInline.mode
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
        if (conf.configType !== newConfig.configType) {
          return false;
        }
        switch (conf.configType) {
          case 'GitConfigProviderSpec':
            return isSameGitConf(newConfig as GitConfigProviderSpec, conf as GitConfigProviderSpec);
          case 'HttpConfigProviderSpec':
            return isSameHttpConf(newConfig as HttpConfigProviderSpec, conf as HttpConfigProviderSpec);
          case 'KubernetesSecretProviderSpec':
            return isSameSecretConf(newConfig as KubernetesSecretProviderSpec, conf as KubernetesSecretProviderSpec);
          case 'InlineConfigProviderSpec':
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

export const getAPIConfig = (ct: SpecConfigTemplate): ConfigSourceProvider => {
  if (isGitConfigTemplate(ct)) {
    return {
      configType: 'GitConfigProviderSpec',
      name: ct.name,
      gitRef: {
        path: ct.path,
        repository: ct.repository,
        targetRevision: ct.targetRevision,
        mountPath: ct.mountPath,
      },
    };
  }
  if (isKubeSecretTemplate(ct)) {
    return {
      configType: 'KubernetesSecretProviderSpec',
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
      configType: 'HttpConfigProviderSpec',
      name: ct.name,
      httpRef: {
        repository: ct.repository,
        suffix: ct.suffix,
        filePath: ct.filePath,
      },
    };
  }
  return {
    configType: 'InlineConfigProviderSpec',
    inline: ct.files.map((file) => {
      return {
        path: file.path,
        content: file.content,
        group: file.group,
        user: file.user,
        mode: file.permissions ? parseInt(file.permissions, 8) : undefined,
        contentEncoding: file.base64 ? FileSpec.contentEncoding.BASE64 : undefined,
      };
    }),
    name: ct.name,
  };
};

export const getConfigTemplatesValues = (deviceSpec?: DeviceSpec) =>
  deviceSpec?.config?.map<SpecConfigTemplate>((c) => {
    if (isGitProviderSpec(c)) {
      return {
        type: 'git',
        name: c.name,
        path: c.gitRef.path,
        mountPath: c.gitRef.mountPath,
        repository: c.gitRef.repository,
        targetRevision: c.gitRef.targetRevision,
      } as GitConfigTemplate;
    }
    if (isKubeProviderSpec(c)) {
      return {
        type: 'secret',
        name: c.name,
        mountPath: c.secretRef.mountPath,
        secretName: c.secretRef.name,
        secretNs: c.secretRef.namespace,
      } as KubeSecretTemplate;
    }
    if (isHttpProviderSpec(c)) {
      return {
        type: 'http',
        name: c.name,
        repository: c.httpRef.repository,
        suffix: c.httpRef.suffix,
        filePath: c.httpRef.filePath,
      } as HttpConfigTemplate;
    }

    return {
      type: 'inline',
      name: c.name,
      files: c.inline.map((inline) => {
        return {
          user: inline.user,
          group: inline.group,
          path: inline.path,
          permissions: inline.mode !== undefined ? inline.mode.toString(8) : undefined,
          content: inline.content,
          base64: inline.contentEncoding === FileSpec.contentEncoding.BASE64,
        } as InlineConfigTemplate['files'][0];
      }),
    } as InlineConfigTemplate;
  }) || [];
