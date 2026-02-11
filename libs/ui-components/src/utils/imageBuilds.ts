import { TFunction } from 'react-i18next';
import {
  ExportFormatType,
  ImageBuild,
  ImageBuildConditionReason,
  ImageBuildConditionType,
  ImageBuildDestination,
  ImageBuildSource,
  ImageExport,
  ImageExportConditionReason,
  ImageExportConditionType,
} from '@flightctl/types/imagebuilder';
import { Repository } from '@flightctl/types';
import { isOciRepoSpec } from '../components/Repository/CreateRepository/utils';

export const getAllExportFormats = () => [
  ExportFormatType.ExportFormatTypeISO,
  ExportFormatType.ExportFormatTypeQCOW2DiskContainer,
  ExportFormatType.ExportFormatTypeQCOW2,
  ExportFormatType.ExportFormatTypeVMDK,
];

export const getImageBuildImage = (srcOrDst: ImageBuildSource | ImageBuildDestination | undefined) => {
  if (!srcOrDst) {
    return '-';
  }
  return `${srcOrDst.imageName}:${srcOrDst.imageTag}`;
};

export const getExportFormatDescription = (t: TFunction, format: ExportFormatType) => {
  switch (format) {
    case ExportFormatType.ExportFormatTypeVMDK:
      return t('For enterprise virtualization platforms.');
    case ExportFormatType.ExportFormatTypeQCOW2:
      return t('For virtualized edge workloads.');
    case ExportFormatType.ExportFormatTypeQCOW2DiskContainer:
      return t('For OpenShift Virtualization.');
    case ExportFormatType.ExportFormatTypeISO:
      return t('For physical edge devices and bare metal.');
  }
};

export const getExportFormatLabel = (t: TFunction, format: ExportFormatType) => {
  switch (format) {
    case ExportFormatType.ExportFormatTypeQCOW2DiskContainer:
      return t('QCOW2 (Container)');
    default:
      return format.toUpperCase();
  }
};

const getOciRepositoryUrl = (repositories: Repository[], repositoryName: string): string | undefined => {
  const repo = repositories.find((r) => r.metadata.name === repositoryName);
  if (!repo || !isOciRepoSpec(repo.spec)) {
    return undefined;
  }
  return repo.spec.registry;
};

export const getImageReference = (
  repositories: Repository[],
  imageTarget: ImageBuildSource | ImageBuildDestination,
) => {
  const registryUrl = getOciRepositoryUrl(repositories, imageTarget.repository);
  if (!registryUrl) {
    return undefined;
  }
  if (!(imageTarget.imageTag && imageTarget.imageName)) {
    return undefined;
  }
  return `${registryUrl}/${imageTarget.imageName}:${imageTarget.imageTag}`;
};

export const getImageBuildStatusReason = (imageBuild: ImageBuild): ImageBuildConditionReason => {
  const readyCondition = imageBuild.status?.conditions?.find(
    (c) => c.type === ImageBuildConditionType.ImageBuildConditionTypeReady,
  );
  return (
    (readyCondition?.reason as ImageBuildConditionReason) || ImageBuildConditionReason.ImageBuildConditionReasonPending
  );
};

export const getImageExportStatusReason = (imageExport: ImageExport): ImageExportConditionReason => {
  const readyCondition = imageExport.status?.conditions?.find(
    (c) => c.type === ImageExportConditionType.ImageExportConditionTypeReady,
  );
  return (
    (readyCondition?.reason as ImageExportConditionReason) ||
    ImageExportConditionReason.ImageExportConditionReasonPending
  );
};

export const isImageBuildActiveReason = (reason: ImageBuildConditionReason): boolean => {
  return (
    reason === ImageBuildConditionReason.ImageBuildConditionReasonPending ||
    reason === ImageBuildConditionReason.ImageBuildConditionReasonBuilding ||
    reason === ImageBuildConditionReason.ImageBuildConditionReasonPushing ||
    reason === ImageBuildConditionReason.ImageBuildConditionReasonCanceling
  );
};

export const isImageBuildCancelable = (reason: ImageBuildConditionReason): boolean => {
  return (
    reason === ImageBuildConditionReason.ImageBuildConditionReasonPending ||
    reason === ImageBuildConditionReason.ImageBuildConditionReasonBuilding ||
    reason === ImageBuildConditionReason.ImageBuildConditionReasonPushing
  );
};

export const isImageExportActiveReason = (reason: ImageExportConditionReason): boolean => {
  return (
    reason === ImageExportConditionReason.ImageExportConditionReasonPending ||
    reason === ImageExportConditionReason.ImageExportConditionReasonConverting ||
    reason === ImageExportConditionReason.ImageExportConditionReasonPushing ||
    reason === ImageExportConditionReason.ImageExportConditionReasonCanceling
  );
};

// Validate that a URL is safe to use for download (only http/https protocols)
const isValidDownloadUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export type ExportDownloadResult =
  | { type: 'redirect'; url: string }
  | { type: 'blob'; blob: Blob; filename: string | undefined };

// The ImageBuilder API download endpoint returns two types of responses: a redirect URL or a blob.
// When it returns a redirect URL, the UI proxy rewrites the response to 200 with { redirectUrl: CDN_URL }
// When no redirect URL is found, we should download the blob directly.
export const getExportDownloadResult = async (response: Response): Promise<ExportDownloadResult | null> => {
  if (!response.ok || response.type === 'opaqueredirect' || response.status === 0) {
    return null;
  }

  // Extract the redirect URL returned by the UI proxy
  const contentType = response.headers.get('Content-Type') || '';
  if (response.ok && contentType.includes('application/json')) {
    const data = (await response.json()) as { redirectUrl?: string };
    const url = data?.redirectUrl;
    if (url && isValidDownloadUrl(url)) {
      return { type: 'redirect', url };
    }
    return null;
  }

  // Download the blob directly
  const blob = await response.blob();

  let filename = '';
  const disposition = response.headers.get('Content-Disposition');
  if (disposition) {
    const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '');
    }
  }

  return { type: 'blob', blob, filename };
};
