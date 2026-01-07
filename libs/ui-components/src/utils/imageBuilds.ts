import { TFunction } from 'react-i18next';
import {
  ExportFormatType,
  ImageBuild,
  ImageBuildConditionReason,
  ImageBuildConditionType,
  ImageBuildDestination,
  ImageBuildSource,
  ImageExport,
} from '@flightctl/types/imagebuilder';
import { Repository } from '@flightctl/types';
import { isOciRepoSpec } from '../components/Repository/CreateRepository/utils';

export const getImageBuildSourceImage = (imageBuild: ImageBuild | undefined) => {
  if (!imageBuild) {
    return '-';
  }
  const { source } = imageBuild.spec;
  return `${source.imageName}:${source.imageTag}`;
};

export const getImageBuildDestinationImage = (imageBuild: ImageBuild | undefined) => {
  if (!imageBuild) {
    return '-';
  }
  const { destination } = imageBuild.spec;
  return `${destination.imageName}:${destination.tag}`;
};

export const getExportFormatDescription = (t: TFunction, format: ExportFormatType) => {
  switch (format) {
    case ExportFormatType.ExportFormatTypeVMDK:
      return t('For enterprise virtualization platforms.');
    case ExportFormatType.ExportFormatTypeQCOW2:
      return t('For virtualized edge workloads and OpenShift Virtualization.');
    case ExportFormatType.ExportFormatTypeISO:
      return t('For physical edge devices and bare metal.');
  }
};

export const getExportFormatLabel = (format: ExportFormatType) => `.${format.toUpperCase()}`;

const getOciRepositoryUrl = (repositories: Repository[], repositoryName: string): string | undefined => {
  const repo = repositories.find((r) => r.metadata.name === repositoryName);
  if (!repo || !isOciRepoSpec(repo.spec)) {
    return undefined;
  }
  return repo.spec.registry;
};

const getImageReference = (repositories: Repository[], imageTarget: ImageBuildSource) => {
  const registryUrl = getOciRepositoryUrl(repositories, imageTarget.repository);
  if (!registryUrl) {
    return undefined;
  }
  if (!(imageTarget.imageTag && imageTarget.imageName)) {
    return undefined;
  }
  return `${registryUrl}/${imageTarget.imageName}:${imageTarget.imageTag}`;
};

// Represents the actual URL for the source image
export const getSourceImageReference = (imageTarget: ImageBuildSource, repositories: Repository[]) => {
  if (!imageTarget) {
    return undefined;
  }
  return getImageReference(repositories, imageTarget);
};

// Represents the actual URL for the image export, which is in the form registry/imageName:manifestDigest
// If manifestDigest is available, use it as the tag, otherwise fallback to the expected tag
export const getActualImageExportReference = (imageExport: ImageExport, repositories: Repository[]) => {
  if (!imageExport) {
    return undefined;
  }

  const { destination } = imageExport.spec;
  const registryUrl = getOciRepositoryUrl(repositories, destination.repository);
  if (!registryUrl) {
    return undefined;
  }

  return getImageReference(repositories, {
    repository: destination.repository,
    imageName: destination.imageName,
    imageTag: imageExport.status?.manifestDigest || destination.tag,
  });
};

// Represents the expected URL for the output image
// It won't actually match the URL of the image, as it gets tagged with the digest therefore it can't be known beforehand
export const getExpectedOutputImageReference = (
  imageDestination: ImageBuildDestination,
  repositories: Repository[],
) => {
  if (!imageDestination) {
    return undefined;
  }

  return getImageReference(repositories, {
    repository: imageDestination.repository,
    imageName: imageDestination.imageName,
    imageTag: imageDestination.tag, // both field names should be consistent but the API has named them differently
  });
};

export const hasImageBuildFailed = (imageBuild: ImageBuild): boolean => {
  const readyCondition = imageBuild.status?.conditions?.find(
    (c) => c.type === ImageBuildConditionType.ImageBuildConditionTypeReady,
  );
  return readyCondition?.reason === ImageBuildConditionReason.ImageBuildConditionReasonFailed;
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
  if (isDownloadResultRedirect(response)) {
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
export const getExportDownloadResult = async (response: Response): Promise<ExportDownloadResult> => {
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
