import { TFunction } from 'i18next';

import { CliArtifact, CliArtifactTool } from '../types/extraTypes';

// The OpenShift Console sorts links alphabetically using case-sensitive comparison.
// To match the same ordering, we define the sorting here.
const OS_SORT_ORDER: Record<string, number> = {
  linux: 0,
  mac: 1,
  windows: 2,
};

const ARCH_SORT_ORDER: Record<string, number> = {
  arm64: 0,
  amd64: 1,
};

export const sortCliArtifacts = (artifacts: CliArtifact[]): CliArtifact[] =>
  [...artifacts].sort((a, b) => {
    const osA = OS_SORT_ORDER[a.os] ?? 99;
    const osB = OS_SORT_ORDER[b.os] ?? 99;
    if (osA !== osB) {
      return osA - osB;
    }
    const archA = ARCH_SORT_ORDER[a.arch] ?? 99;
    const archB = ARCH_SORT_ORDER[b.arch] ?? 99;
    return archA - archB;
  });

export const getArtifactUrl = (baseUrl: string, artifact: CliArtifact) => {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${artifact.arch}/${artifact.os}/${artifact.filename}`;
};

export const getArtifactTool = (artifact: CliArtifact) => {
  if (!artifact.tool) {
    // Handle backward compatibility with older artifacts before "tool" was added
    // Only flightctl and flightctl-restore existed back then.
    return artifact.filename.includes('flightctl-restore')
      ? CliArtifactTool.FlightctlRestore
      : CliArtifactTool.Flightctl;
  }
  return artifact.tool;
};

export const getArchLabel = (arch: string): string => {
  switch (arch) {
    case 'amd64':
      return 'x86_64';
    case 'arm64':
      return 'ARM64';
    default:
      return arch;
  }
};

export const getArtifactDownloadLabel = (artifact: CliArtifact, t: TFunction): string => {
  const archLabel = getArchLabel(artifact.arch);
  const toolLabel = getArtifactTool(artifact);
  switch (artifact.os) {
    case 'mac':
      return t('Download {{ tool }} for Mac ({{ arch }})', { tool: toolLabel, arch: archLabel });
    case 'linux':
      return t('Download {{ tool }} for Linux ({{ arch }})', { tool: toolLabel, arch: archLabel });
    case 'windows':
      return t('Download {{ tool }} for Windows ({{ arch }})', { tool: toolLabel, arch: archLabel });
  }
};
