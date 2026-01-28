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

export const isImageExportActiveReason = (reason: ImageExportConditionReason): boolean => {
  return (
    reason === ImageExportConditionReason.ImageExportConditionReasonPending ||
    reason === ImageExportConditionReason.ImageExportConditionReasonConverting ||
    reason === ImageExportConditionReason.ImageExportConditionReasonPushing ||
    reason === ImageExportConditionReason.ImageExportConditionReasonCanceling
  );
};

const isDownloadResultRedirect = (response: Response): boolean => {
  return (
    response.status === 302 ||
    response.status === 301 ||
    response.status === 307 ||
    response.status === 308 ||
    response.type === 'opaqueredirect' ||
    response.status === 0
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

const getRedirectUrl = (response: Response): string | undefined => {
  // If the Location header is present, it indicates a redirect.
  const redirectUrl = response.headers.get('Location');
  if (redirectUrl) {
    return redirectUrl;
  }
  if (isDownloadResultRedirect(response) && response.url) {
    return response.url;
  }
  return undefined;
};

export type ExportDownloadResult =
  | { type: 'redirect'; url: string }
  | { type: 'blob'; blob: Blob; filename: string | undefined };

// The download endpoint returns two types of responses: a redirect URL or a blob.
// If a redirect URL is found, we should use it to trigger the download in the browser.
// If no redirect URL is found, we should download the blob directly.
export const getExportDownloadResult = async (response: Response): Promise<ExportDownloadResult | null> => {
  if (!response.ok && response.status !== 0) {
    return null;
  }
  const redirectUrl = getRedirectUrl(response);
  if (redirectUrl) {
    if (!isValidDownloadUrl(redirectUrl)) {
      throw new Error('Invalid redirect URL received from server');
    }
    return { type: 'redirect', url: redirectUrl };
  }

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
