import yaml from 'js-yaml';

import {
  AppType,
  type ApplicationProviderSpec,
  type DeviceApplicationStatus,
  type VmApplication,
} from '@flightctl/types';
import { type PortMapping, isInlineVariantApp } from '../types/deviceSpec';

export type VmApplicationConfig = {
  domain?: {
    cpu?: { cores?: number };
    memory?: { guest?: string };
  };
  volumes?: Array<{
    containerDisk?: { image?: string };
    cloudInitNoCloud?: { userData?: string };
  }>;
};

export type ParsedVmConfig = {
  cpuCores: string;
  memory: string;
  diskImage: string;
};

export type ParsedVmCloudInit = {
  enableSshKey: boolean;
  sshPublicKey: string;
  enablePassword: boolean;
  password: string;
  additionalCloudInit: string;
  documentParsed: boolean;
};

export type ParsedVmFormFields = ParsedVmConfig &
  ParsedVmCloudInit & {
    cpuCoresNumber: number;
    cloudInit: string;
  };

export type VmCloudInitCredentials = Pick<
  ParsedVmCloudInit,
  'enableSshKey' | 'sshPublicKey' | 'enablePassword' | 'password'
>;

const CLOUD_CONFIG_HEADER = '#cloud-config';

export const CLOUD_INIT_CREDENTIAL_KEYS = new Set(['ssh_authorized_keys', 'ssh_pwauth', 'chpasswd', 'password']);

const stripCloudConfigHeader = (content: string): string => content.replace(/^#cloud-config\s*\n?/, '').trim();

type ParsedCloudInitDocument =
  | { ok: true; config: Record<string, unknown>; hasHeader: boolean }
  | { ok: false; raw: string; hasHeader: boolean };

const parseCloudInitDocument = (cloudInit: string): ParsedCloudInitDocument => {
  const trimmed = (cloudInit || '').trim();
  if (!trimmed) {
    return { ok: true, config: {}, hasHeader: false };
  }

  const hasHeader = trimmed.startsWith(CLOUD_CONFIG_HEADER);
  const withoutHeader = stripCloudConfigHeader(trimmed);
  if (!withoutHeader) {
    return { ok: true, config: {}, hasHeader };
  }

  try {
    const parsed = yaml.load(withoutHeader);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, raw: withoutHeader, hasHeader };
    }
    return { ok: true, config: parsed as Record<string, unknown>, hasHeader };
  } catch {
    return { ok: false, raw: withoutHeader, hasHeader };
  }
};

const removeManagedCredentialKeys = (config: Record<string, unknown>): Record<string, unknown> => {
  const result = { ...config };
  for (const key of CLOUD_INIT_CREDENTIAL_KEYS) {
    delete result[key];
  }
  return result;
};

const serializeCloudInitDocument = (config: Record<string, unknown>, hasHeader: boolean): string => {
  if (Object.keys(config).length === 0) {
    return hasHeader ? CLOUD_CONFIG_HEADER : '';
  }

  const body = yaml.dump(config, { lineWidth: -1 }).replace(/\n$/, '');
  return hasHeader ? `${CLOUD_CONFIG_HEADER}\n${body}` : body;
};

const buildCredentialConfig = (credentials: VmCloudInitCredentials): Record<string, unknown> => {
  const config: Record<string, unknown> = {};
  if (credentials.enableSshKey && credentials.sshPublicKey) {
    config.ssh_authorized_keys = [credentials.sshPublicKey.trim().split('\n')[0]];
  }
  if (credentials.enablePassword && credentials.password) {
    config.ssh_pwauth = true;
    config.chpasswd = { expire: false };
    config.password = credentials.password;
  }
  return config;
};

const appendStructuralCredentials = (userBase: string, credentials: VmCloudInitCredentials): string => {
  const doc = parseCloudInitDocument(userBase);
  if (doc.ok) {
    return serializeCloudInitDocument(
      { ...removeManagedCredentialKeys(doc.config), ...buildCredentialConfig(credentials) },
      true,
    );
  }

  const credentialConfig = buildCredentialConfig(credentials);
  if (!doc.raw.trim()) {
    return serializeCloudInitDocument(credentialConfig, true);
  }

  const userPart = doc.hasHeader ? `${CLOUD_CONFIG_HEADER}\n${doc.raw}` : doc.raw;
  if (Object.keys(credentialConfig).length === 0) {
    return userPart;
  }

  return `${userPart}\n${yaml.dump(credentialConfig, { lineWidth: -1 }).trimEnd()}`;
};

export const stripCredentialLinesFromCloudInit = (cloudInit: string): string => {
  const doc = parseCloudInitDocument(cloudInit);
  if (!doc.ok) {
    return doc.hasHeader ? `${CLOUD_CONFIG_HEADER}\n${doc.raw}` : doc.raw;
  }

  return serializeCloudInitDocument(removeManagedCredentialKeys(doc.config), doc.hasHeader);
};

export const buildCloudInitUserData = (userBase: string, credentials: VmCloudInitCredentials): string => {
  const doc = parseCloudInitDocument(userBase);
  if (!doc.ok) {
    return appendStructuralCredentials(userBase, credentials);
  }

  const config = { ...removeManagedCredentialKeys(doc.config), ...buildCredentialConfig(credentials) };
  if (Object.keys(config).length === 0) {
    return '';
  }

  return serializeCloudInitDocument(config, true);
};

export const VM_PORT_PROTOCOLS = ['tcp', 'udp', 'sctp'] as const;

export type StatusAppWithSpec = {
  status: DeviceApplicationStatus;
  spec: ApplicationProviderSpec | null;
};

type AppsByType = {
  workloadApps: StatusAppWithSpec[];
  vmApps: StatusAppWithSpec[];
};

export const getAppsByType = (
  appsStatus: DeviceApplicationStatus[],
  appsSpecs: ApplicationProviderSpec[],
): AppsByType => {
  const appsByType: AppsByType = { workloadApps: [], vmApps: [] };
  appsStatus.forEach((status) => {
    const appSpec = appsSpecs.find((spec) => spec.name === status.name) || null;
    if (status.appType === AppType.AppTypeVm) {
      appsByType.vmApps.push({ status, spec: appSpec });
    } else {
      appsByType.workloadApps.push({ status, spec: appSpec });
    }
  });
  return appsByType;
};

export const getConsoleAppStatuses = (appsStatus: DeviceApplicationStatus[] = []): DeviceApplicationStatus[] =>
  appsStatus.filter((app) => app.appType === AppType.AppTypeVm);

export const getVmYamlContent = (spec?: VmApplication): string | undefined => {
  if (!spec || !isInlineVariantApp(spec)) {
    return undefined;
  }
  return spec.inline.find((file) => file.path === 'vm.yaml')?.content;
};

type VmYamlManifestDoc = {
  apiVersion?: string;
  kind?: string;
  metadata?: { name?: string };
  spec?: unknown;
};

export const loadYamlDocument = (content: string): VmYamlManifestDoc | null => {
  try {
    return yaml.load(content) as VmYamlManifestDoc | null;
  } catch {
    return null;
  }
};

export const parseVmCloudInitUserData = (userData: string | undefined): ParsedVmCloudInit => {
  const empty: ParsedVmCloudInit = {
    enableSshKey: false,
    sshPublicKey: '',
    enablePassword: false,
    password: '',
    additionalCloudInit: '',
    documentParsed: false,
  };
  if (!userData) {
    return empty;
  }

  const doc = parseCloudInitDocument(userData);
  if (!doc.ok) {
    return { ...empty, additionalCloudInit: doc.raw };
  }

  const config = doc.config;
  const sshKeys = config.ssh_authorized_keys;
  const sshPublicKey = Array.isArray(sshKeys) && typeof sshKeys[0] === 'string' ? sshKeys[0] : '';
  const password = typeof config.password === 'string' ? config.password : '';

  const additionalConfig = removeManagedCredentialKeys(config);
  const additionalCloudInit =
    Object.keys(additionalConfig).length > 0 ? yaml.dump(additionalConfig, { lineWidth: -1 }).replace(/\n$/, '') : '';

  return {
    enableSshKey: !!sshPublicKey,
    sshPublicKey,
    enablePassword: !!password,
    password,
    additionalCloudInit,
    documentParsed: true,
  };
};

export const parseVmYamlForForm = (content: string | undefined): ParsedVmFormFields | null => {
  if (!content?.trim()) {
    return null;
  }

  try {
    const doc = yaml.load(content) as {
      spec?: {
        template?: {
          spec?: VmApplicationConfig;
        };
      };
    };

    const templateSpec = doc?.spec?.template?.spec;
    const domain = templateSpec?.domain;
    const containerDiskVolume = templateSpec?.volumes?.find((volume) => volume.containerDisk?.image);
    const cloudInitVolume = templateSpec?.volumes?.find((volume) => volume.cloudInitNoCloud?.userData);

    const cpuCores = domain?.cpu?.cores?.toString() || '';
    const guestMemory = domain?.memory?.guest || '';
    const diskImage = containerDiskVolume?.containerDisk?.image || '';
    const rawUserData = cloudInitVolume?.cloudInitNoCloud?.userData ?? '';
    const cloudInit = parseVmCloudInitUserData(rawUserData);

    if (!cpuCores && !guestMemory && !diskImage) {
      return null;
    }

    return {
      cpuCores,
      cpuCoresNumber: domain?.cpu?.cores || 1,
      memory: guestMemory,
      diskImage,
      cloudInit: rawUserData,
      ...cloudInit,
    };
  } catch {
    return null;
  }
};

type YamlObject = Record<string, unknown>;

const asYamlObject = (value: unknown): YamlObject | undefined =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as YamlObject) : undefined;

const hasUnexpectedKeys = (
  value: unknown,
  allowedKeys: Set<string>,
  { required = true }: { required?: boolean } = {},
): boolean => {
  const obj = asYamlObject(value);
  if (!obj) {
    return required;
  }
  return Object.keys(obj).some((key) => !allowedKeys.has(key));
};

const getKnownYamlObject = (value: unknown, allowedKeys: Set<string>): YamlObject | undefined =>
  hasUnexpectedKeys(value, allowedKeys) ? undefined : asYamlObject(value);

const isFormDiskEntryValid = (disk: unknown): boolean => {
  const diskEntry = getKnownYamlObject(disk, new Set(['name', 'disk']));
  if (!diskEntry || typeof diskEntry.name !== 'string') {
    return false;
  }
  if (diskEntry.name !== 'containerdisk' && diskEntry.name !== 'cloudinitdisk') {
    return false;
  }
  const diskSpec = getKnownYamlObject(diskEntry.disk, new Set(['bus']));
  return !!diskSpec && diskSpec.bus === 'virtio';
};

const areFormDisksValid = (disks: unknown): boolean => {
  if (!Array.isArray(disks) || disks.length !== 2) {
    return false;
  }
  const names = new Set<string>();
  for (const disk of disks) {
    if (isFormDiskEntryValid(disk)) {
      names.add(String((disk as YamlObject).name));
    }
  }
  return names.size === 2;
};

const isFormVolumeEntryValid = (volume: unknown): boolean => {
  const volumeEntry = getKnownYamlObject(volume, new Set(['name', 'containerDisk', 'cloudInitNoCloud']));
  if (!volumeEntry || typeof volumeEntry.name !== 'string') {
    return false;
  }
  if (volumeEntry.name === 'containerdisk') {
    return !!getKnownYamlObject(volumeEntry.containerDisk, new Set(['image'])) && !volumeEntry.cloudInitNoCloud;
  }
  if (volumeEntry.name === 'cloudinitdisk') {
    return !!getKnownYamlObject(volumeEntry.cloudInitNoCloud, new Set(['userData'])) && !volumeEntry.containerDisk;
  }
  return false;
};

const areFormVolumesValid = (volumes: unknown): boolean => {
  if (!Array.isArray(volumes) || volumes.length !== 2) {
    return false;
  }
  const names = new Set<string>();
  for (const volume of volumes) {
    if (isFormVolumeEntryValid(volume)) {
      names.add(String((volume as YamlObject).name));
    }
  }
  return names.size === 2;
};

/** True when vm.yaml contains settings outside the guided form (e.g. Windows, networking, hostDisk). */
export const vmYamlHasAdvancedSettings = (content: string | undefined): boolean => {
  if (!content?.trim()) {
    return false;
  }

  const doc = loadYamlDocument(content);
  if (!doc || doc.apiVersion !== 'kubevirt.io/v1' || doc.kind !== 'VirtualMachine') {
    return true;
  }

  if (hasUnexpectedKeys(doc.metadata, new Set(['name']), { required: false })) {
    return true;
  }

  const spec = getKnownYamlObject(doc.spec, new Set(['template', 'running']));
  if (!spec) {
    return true;
  }

  const template = getKnownYamlObject(spec.template, new Set(['spec']));
  if (!template) {
    return true;
  }

  const templateSpec = getKnownYamlObject(template.spec, new Set(['domain', 'volumes']));
  if (!templateSpec) {
    return true;
  }

  const domain = getKnownYamlObject(templateSpec.domain, new Set(['cpu', 'memory', 'devices']));
  if (!domain) {
    return true;
  }

  if (hasUnexpectedKeys(domain.cpu, new Set(['cores']))) {
    return true;
  }
  if (hasUnexpectedKeys(domain.memory, new Set(['guest']))) {
    return true;
  }

  const devices = getKnownYamlObject(domain.devices, new Set(['disks']));
  if (!devices) {
    return true;
  }

  if (!areFormDisksValid(devices.disks)) {
    return true;
  }

  if (!areFormVolumesValid(templateSpec.volumes)) {
    return true;
  }

  return false;
};

export const parseVmYaml = (content: string | undefined): ParsedVmConfig | null => {
  const parsed = parseVmYamlForForm(content);
  if (!parsed) {
    return null;
  }

  return {
    cpuCores: parsed.cpuCores,
    memory: parsed.memory,
    diskImage: parsed.diskImage,
  };
};

export const formatVmPortMappingText = ({ hostPort, targetPort, protocol }: PortMapping): string => {
  const base = `${hostPort}:${targetPort}`;
  const normalizedProtocol = (protocol || 'tcp').toLowerCase();
  return normalizedProtocol !== 'tcp' ? `${base}/${normalizedProtocol}` : base;
};

export const formatPublishPorts = (mappings: PortMapping[]): string[] => mappings.map(formatVmPortMappingText);
