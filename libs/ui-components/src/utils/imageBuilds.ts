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
